import express from "express";

import {
  createDonationOrder,
  verifyDonationPayment,
  myDonations,
} from "../controllers/donation.controller.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

// Create Razorpay order
router.post(
  "/create-order",
  auth,
  createDonationOrder
);

// Verify successful Razorpay payment
router.post(
  "/verify",
  auth,
  verifyDonationPayment
);

// Logged-in user's donation history
router.get(
  "/mine",
  auth,
  myDonations
);

export default router;