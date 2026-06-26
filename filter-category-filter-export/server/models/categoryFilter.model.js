const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
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

const categoryFilterSchema = new mongoose.Schema(
  {
    category: {
      type: ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    filter: {
      type: ObjectId,
      ref: "FilterDefinition",
      required: [true, "Filter definition is required"],
    },
    key: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[a-z][a-z0-9_]*$/, "Filter key must be snake_case"],
      maxLength: [60, "Filter key must be at most 60 characters"],
    },
    label: {
      type: String,
      trim: true,
      maxLength: [100, "Filter label must be at most 100 characters"],
    },
    type: {
      type: String,
      enum: ["text", "number", "range", "boolean", "select", "multi_select", "color"],
      default: "select",
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
    isRequired: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

categoryFilterSchema.index(
  { category: 1, filter: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const CategoryFilter = mongoose.model("CategoryFilter", categoryFilterSchema);

module.exports = CategoryFilter;
