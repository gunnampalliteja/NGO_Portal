import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },

    category: {
      type: String,
      enum: [
        "Education",
        "Healthcare",
        "Food",
        "Clean Water",
        "Environment",
        "Emergency",
        "Other",
      ],
      required: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    goalAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    raisedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    donorCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    location: {
      type: String,
      default: "India",
      trim: true,
    },

    organization: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },

    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Virtual: Funding Percentage
|--------------------------------------------------------------------------
*/

campaignSchema.virtual("fundingPercentage").get(function () {
  if (!this.goalAmount || this.goalAmount <= 0) {
    return 0;
  }

  return Math.min(
    Math.round((this.raisedAmount / this.goalAmount) * 100),
    100
  );
});

/*
|--------------------------------------------------------------------------
| Virtual: Remaining Amount
|--------------------------------------------------------------------------
*/

campaignSchema.virtual("remainingAmount").get(function () {
  return Math.max(this.goalAmount - this.raisedAmount, 0);
});

/*
|--------------------------------------------------------------------------
| Virtual: Days Remaining
|--------------------------------------------------------------------------
*/

campaignSchema.virtual("daysRemaining").get(function () {
  if (!this.deadline) {
    return null;
  }

  const now = new Date();
  const deadline = new Date(this.deadline);

  const difference = deadline.getTime() - now.getTime();

  return Math.max(
    Math.ceil(difference / (1000 * 60 * 60 * 24)),
    0
  );
});

/*
|--------------------------------------------------------------------------
| Automatically include virtual fields in JSON
|--------------------------------------------------------------------------
*/

campaignSchema.set("toJSON", {
  virtuals: true,
});

campaignSchema.set("toObject", {
  virtuals: true,
});

/*
|--------------------------------------------------------------------------
| Automatically mark campaign completed when goal is reached
|--------------------------------------------------------------------------
*/

campaignSchema.pre("save", function (next) {
  if (
    this.raisedAmount >= this.goalAmount &&
    this.status === "active"
  ) {
    this.status = "completed";
  }

  next();
});

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;