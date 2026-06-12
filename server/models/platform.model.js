const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const baseSchema = require("./baseSchema.model");

const platformSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Platform name is required"],
      trim: true,
      maxLength: [120, "Platform name must be at most 120 characters"],
    },
    slug: {
      type: String,
      required: [true, "Platform slug is required"],
      trim: true,
      lowercase: true,
      maxLength: [140, "Platform slug must be at most 140 characters"],
    },
    parent: {
      type: ObjectId,
      ref: "Platform",
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxLength: [700, "Description must be at most 700 characters"],
    },
    productionDate: {
      type: Date,
      default: null,
    },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

platformSchema.index(
  { slug: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Platform = mongoose.model("Platform", platformSchema);

module.exports = Platform;
