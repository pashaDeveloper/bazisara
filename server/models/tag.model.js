const mongoose = require("mongoose");
const baseSchema = require("./baseSchema.model");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
      maxLength: [100, "Tag name must be at most 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Tag slug is required"],
      trim: true,
      lowercase: true,
      maxLength: [140, "Tag slug must be at most 140 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxLength: [1000, "Description must be at most 1000 characters"],
    },
    seoTitle: {
      type: String,
      trim: true,
      default: "",
      maxLength: [160, "SEO title must be at most 160 characters"],
    },
    seoDescription: {
      type: String,
      trim: true,
      default: "",
      maxLength: [320, "SEO description must be at most 320 characters"],
    },
    seoKeywords: [
      {
        type: String,
        trim: true,
        maxLength: [80, "SEO keyword must be at most 80 characters"],
      },
    ],
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
    ...baseSchema.obj,
  },
  { timestamps: true }
);

tagSchema.index(
  { slug: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
