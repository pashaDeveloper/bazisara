const { createBlurFields } = require("../utils/mediaSchema.util");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const baseSchema = require("./baseSchema.model");
const { makeCategorySlug } = require("../utils/categorySlug.util");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxLength: [100, "Category name must be at most 100 characters"],
    },
    slug: { type: String, trim: true, lowercase: true, maxLength: 140 },
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
      blur: createBlurFields(),
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
      storage: {
        type: String,
        enum: ["", "cloudinary", "arvan", "local"],
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

categorySchema.pre("validate", function () {
  this.slug = makeCategorySlug(this.slug || this.name);
});
categorySchema.index(
  { parent: 1, slug: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false, slug: { $type: "string" } } }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
