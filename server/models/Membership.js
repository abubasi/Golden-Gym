const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    plan: {
      type: String,
      required: true,
      trim: true,
    },
    billing: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      trim: true,
    },
    fitnessGoal: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "cash",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "approved", "rejected"],
      default: "new",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentReference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Membership", membershipSchema);
