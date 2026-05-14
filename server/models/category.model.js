const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const baseSchema = require("./baseSchema.model");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxLength: [100, "Category name must be at most 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxLength: [500, "Description must be at most 500 characters"],
    },
    icon: {
      type: ObjectId,
      ref: "Icon",
      default: null,
    },
    image: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },
    parent: {
      type: ObjectId,
      ref: "Category",
      default: null,
    },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

categorySchema.index(
  { parent: 1, name: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
