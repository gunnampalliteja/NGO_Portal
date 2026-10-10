import crypto from "crypto";
import { randomUUID } from "crypto";
import Razorpay from "razorpay";

import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";


// =====================================================
// RAZORPAY INSTANCE
// =====================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

export async function createDonationOrder(req, res) {
  try {
    const {
      campaignId,
      amount,
      donorName,
      message,
    } = req.body;

    const donationAmount = Number(amount);

    // Validate request
    if (
      !campaignId ||
      !Number.isFinite(donationAmount) ||
      donationAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid campaign and donation amount are required",
      });
    }

    // Find campaign
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    // Campaign must be active
    if (campaign.status !== "active") {
      return res.status(400).json({
        success: false,
        message:
          "This campaign is not accepting donations",
      });
    }

    // Calculate remaining amount
    const remainingAmount = Math.max(
      campaign.goalAmount - campaign.raisedAmount,
      0
    );

    if (remainingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "This campaign has already reached its goal",
      });
    }

    // Don't allow donation above remaining goal
    if (donationAmount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message:
          `Maximum donation is ₹${remainingAmount}`,
      });
    }


    // =================================================
    // INTERNAL DONATION REFERENCE
    // =================================================

    const internalReference = randomUUID();


    // =================================================
    // CREATE PENDING DONATION
    // =================================================

    const donation = await Donation.create({
      donor: req.user.id,
      campaign: campaign._id,
      amount: donationAmount,
      donorName: donorName || "Anonymous",
      message: message || "",
      paymentStatus: "pending",
      transactionId: internalReference,
    });


    // =================================================
    // CREATE RAZORPAY ORDER
    // =================================================

    // Razorpay amount is in paise
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(donationAmount * 100),
      currency: "INR",

      // Razorpay receipt has a limited length,
      // so use our internal reference.
      receipt: `KINDORA-${internalReference}`,

      notes: {
        donationId: donation._id.toString(),
        campaignId: campaign._id.toString(),
      },
    });


    // =================================================
    // SAVE REAL RAZORPAY ORDER ID
    // =================================================

    donation.razorpayOrderId =
      razorpayOrder.id;

    await donation.save();


    // =================================================
    // SEND ORDER TO FRONTEND
    // =================================================

    return res.status(201).json({
      success: true,

      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },

      donationId: donation._id,

      key: process.env.RAZORPAY_KEY_ID,

      campaign: {
        id: campaign._id,
        title: campaign.title,
      },
    });

  } catch (error) {
    console.error(
      "Create donation order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create payment order",
      error: error.message,
    });
  }
}


// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

export async function verifyDonationPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
    } = req.body;


    // =================================================
    // VALIDATE PAYMENT DATA
    // =================================================

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !donationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification data is incomplete",
      });
    }


    // =================================================
    // FIND DONATION
    // =================================================

    const donation =
      await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }


    // =================================================
    // CHECK DONATION OWNER
    // =================================================

    if (
      donation.donor &&
      donation.donor.toString() !==
        req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized donation",
      });
    }


    // =================================================
    // CHECK ORDER ID
    // =================================================

    if (
      donation.razorpayOrderId !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment order does not match donation",
      });
    }


    // =================================================
    // PREVENT DUPLICATE PROCESSING
    // =================================================

    if (
      donation.paymentStatus ===
      "completed"
    ) {
      return res.json({
        success: true,
        message:
          "Donation already processed",
        donation,
      });
    }


    // =================================================
    // VERIFY RAZORPAY SIGNATURE
    // =================================================

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");


    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment signature",
      });
    }


    // =================================================
    // FIND CAMPAIGN
    // =================================================

    const campaign =
      await Campaign.findById(
        donation.campaign
      );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message:
          "Campaign not found",
      });
    }


    // =================================================
    // CHECK CAMPAIGN STATUS AGAIN
    // =================================================

    if (
      campaign.status !== "active" &&
      campaign.status !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Campaign is not accepting donations",
      });
    }


    // =================================================
    // MARK DONATION COMPLETED
    // =================================================

    // Mark payment as completed
donation.paymentStatus = "completed";

// Store Razorpay payment details correctly
donation.razorpayOrderId = razorpay_order_id;

donation.razorpayPaymentId = razorpay_payment_id;

donation.razorpaySignature = razorpay_signature;

// Keep payment ID as our transaction reference
donation.transactionId = razorpay_payment_id;

// Generate receipt number
donation.receiptNumber =
  `KINDORA-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;

await donation.save();


    // =================================================
    // UPDATE CAMPAIGN
    // =================================================

    campaign.raisedAmount +=
      donation.amount;

    campaign.donorCount += 1;


    // =================================================
    // COMPLETE CAMPAIGN IF GOAL REACHED
    // =================================================

    if (
      campaign.raisedAmount >=
      campaign.goalAmount
    ) {
      campaign.raisedAmount =
        campaign.goalAmount;

      campaign.status =
        "completed";
    }


    await campaign.save();


    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.json({
      success: true,
      message:
        "Donation successful",

      donation,

      campaign: {
        id: campaign._id,
        title: campaign.title,
        raisedAmount:
          campaign.raisedAmount,
        goalAmount:
          campaign.goalAmount,
        donorCount:
          campaign.donorCount,
        status:
          campaign.status,

        fundingPercentage:
          Math.min(
            Math.round(
              (campaign.raisedAmount /
                campaign.goalAmount) *
                100
            ),
            100
          ),
      },
    });

  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Payment verification failed",
      error: error.message,
    });
  }
}


// =====================================================
// MY DONATIONS
// =====================================================

export async function myDonations(req, res) {
  try {
    const donations =
      await Donation.find({
        donor: req.user.id,
      })
        .populate(
          "campaign",
          "title image slug goalAmount raisedAmount"
        )
        .sort({
          createdAt: -1,
        });


    return res.json({
      success: true,
      count: donations.length,
      donations,
    });

  } catch (error) {
    console.error(
      "My donations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch donations",
      error: error.message,
    });
  }
}