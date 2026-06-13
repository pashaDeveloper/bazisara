const mongoose = require("mongoose");

const baseSchema =  new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    approvalReview: {
      status: {
        type: String,
        enum: ["", "approved", "rejected"],
        default: "",
      },
      reason: {
        type: String,
        trim: true,
        default: "",
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = baseSchema;



