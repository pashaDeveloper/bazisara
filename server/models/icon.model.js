const mongoose = require("mongoose");
const baseSchema = require("./baseSchema.model");

const iconSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Icon name is required"],
      trim: true,
      maxLength: [100, "Icon name must be at most 100 characters"],
    },
    svg: {
      type: String,
      required: [true, "SVG icon is required"],
      trim: true,
      maxLength: [10000, "SVG icon must be at most 10000 characters"],
    },
    color: {
      type: String,
      trim: true,
      default: "",
      maxLength: [50, "Icon color must be at most 50 characters"],
    },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

iconSchema.index(
  { name: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Icon = mongoose.model("Icon", iconSchema);

module.exports = Icon;
