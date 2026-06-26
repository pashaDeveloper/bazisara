const mongoose = require("mongoose");
const baseSchema = require("./baseSchema.model");

const optionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
  },
  { _id: false }
);

const filterDefinitionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Filter key is required"],
      trim: true,
      lowercase: true,
      match: [/^[a-z][a-z0-9_]*$/, "Filter key must be snake_case"],
      maxLength: [60, "Filter key must be at most 60 characters"],
    },
    label: {
      type: String,
      required: [true, "Filter label is required"],
      trim: true,
      maxLength: [100, "Filter label must be at most 100 characters"],
    },
    type: {
      type: String,
      enum: ["text", "number", "range", "boolean", "select", "multi_select", "color"],
      required: [true, "Filter type is required"],
    },
    options: {
      type: [optionSchema],
      default: [],
    },
    min: {
      type: Number,
      default: null,
    },
    max: {
      type: Number,
      default: null,
    },
    unit: {
      type: String,
      trim: true,
      default: "",
      maxLength: [30, "Unit must be at most 30 characters"],
    },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

filterDefinitionSchema.index(
  { key: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const FilterDefinition = mongoose.model("FilterDefinition", filterDefinitionSchema);

module.exports = FilterDefinition;
