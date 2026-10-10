import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    // Logged-in donor
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Campaign receiving the donation
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    // Donation amount in INR
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    // Donor information
    donorName: {
      type: String,
      default: "Anonymous",
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // Payment state
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },

    // Razorpay order ID
    razorpayOrderId: {
      type: String,
      default: "",
      index: true,
    },

    // Razorpay payment ID
    razorpayPaymentId: {
      type: String,
      default: "",
      index: true,
    },

    // Payment signature returned by Razorpay
    razorpaySignature: {
      type: String,
      default: "",
    },

    // Internal transaction ID
    transactionId: {
      type: String,
      default: "",
      index: true,
    },

    // Donation receipt
    receiptNumber: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;