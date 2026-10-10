import express from "express";

import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaign.controller.js";

import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getCampaigns);
router.get("/:id", getCampaign);

// Organizer/Admin only
router.post(
  "/",
  auth,
  requireRole("organizer", "admin"),
  createCampaign
);

router.put(
  "/:id",
  auth,
  requireRole("organizer", "admin"),
  updateCampaign
);

router.delete(
  "/:id",
  auth,
  requireRole("organizer", "admin"),
  deleteCampaign
);

export default router;