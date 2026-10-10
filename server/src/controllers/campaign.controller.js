import Campaign from "../models/Campaign.js";

export const getCampaigns = async (req, res) => {
  try {
    const {
      category,
      search,
      featured,
      status = "active",
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const campaigns = await Campaign.find(filter)
      .sort({
        featured: -1,
        createdAt: -1,
      });

    res.json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
      error: error.message,
    });
  }
};

export const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    res.json({
      success: true,
      campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaign",
      error: error.message,
    });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);

    res.status(201).json({
      success: true,
      campaign,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create campaign",
      error: error.message,
    });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    res.json({
      success: true,
      campaign,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update campaign",
      error: error.message,
    });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(
      req.params.id
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    res.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete campaign",
      error: error.message,
    });
  }
};