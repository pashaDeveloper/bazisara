const mongoose = require("mongoose");
const baseSoftDeletePluginKey = Symbol.for("bazisara.baseSoftDeletePluginRegistered");

function shouldApplySoftDelete(schema) {
  return Boolean(schema.path("isDeleted"));
}

function hasIsDeletedFilter(query = {}) {
  return Object.prototype.hasOwnProperty.call(query, "isDeleted");
}

function baseSoftDeletePlugin(schema) {
  if (!shouldApplySoftDelete(schema)) return;

  const excludeDeleted = function () {
    if (this.getOptions?.().withDeleted) return;
    if (hasIsDeletedFilter(this.getQuery?.())) return;
    this.where({ isDeleted: false });
  };

  schema.pre(/^find/, excludeDeleted);
  schema.pre("countDocuments", excludeDeleted);
  schema.pre("distinct", excludeDeleted);

  schema.pre("aggregate", function () {
    if (this.options?.withDeleted) return;

    const pipeline = this.pipeline();
    const firstStage = pipeline[0];
    const firstMatch = firstStage?.$match;

    if (hasIsDeletedFilter(firstMatch)) return;

    const softDeleteMatch = { isDeleted: false };
    if (firstStage?.$geoNear) {
      pipeline.splice(1, 0, { $match: softDeleteMatch });
      return;
    }

    pipeline.unshift({ $match: softDeleteMatch });
  });

  schema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    if (this.schema.path("status")) this.status = "inactive";
    return this.save();
  };

  schema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.withDeleted = function () {
    return this.find().setOptions({ withDeleted: true });
  };
}

if (!mongoose[baseSoftDeletePluginKey]) {
  mongoose.plugin(baseSoftDeletePlugin);
  mongoose[baseSoftDeletePluginKey] = true;
}

const baseSchema =  new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
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



