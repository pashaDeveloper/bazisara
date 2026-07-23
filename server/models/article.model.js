const mongoose = require("mongoose");
const baseSchema = require("./baseSchema.model");
const { nextPublicId } = require("../utils/publicId.util");

const mediaSchema = new mongoose.Schema(
  {
    blur: {
      hash: { type: String, default: "" },
      width: { type: Number, default: null },
      height: { type: Number, default: null },
    },
    url: { type: String, default: "" },
    public_id: { type: String, default: "" },
    storage: {
      type: String,
      enum: ["", "cloudinary", "arvan", "local"],
      default: "",
    },
    type: { type: String, enum: ["image", "video"], default: "image" },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true, default: "" },
    answer: { type: String, trim: true, default: "" },
    media: [mediaSchema],
  },
  { _id: false }
);

const magazineSchema = new mongoose.Schema(
  {
    magazineId: { type: String, unique: true, sparse: true },
    title: {
      type: String,
      required: [true, "Magazine title is required"],
      trim: true,
      maxLength: [180, "Magazine title must be at most 180 characters"],
    },
    slug: {
      type: String,
      required: [true, "Magazine slug is required"],
      trim: true,
      lowercase: true,
      maxLength: [220, "Magazine slug must be at most 220 characters"],
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
      maxLength: [600, "Excerpt must be at most 600 characters"],
    },
    content: {
      type: String,
      default: "",
    },
    author: {
      type: String,
      trim: true,
      default: "",
      maxLength: [120, "Author must be at most 120 characters"],
    },
    readingTime: {
      type: String,
      trim: true,
      default: "",
      maxLength: [60, "Reading time must be at most 60 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    platforms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Platform" }],
    relatedGames: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    faqs: [faqSchema],
    cover: mediaSchema,
    cardCover: mediaSchema,
    contentCover: mediaSchema,
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
    publishedAt: {
      type: Date,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

magazineSchema.pre("save", async function (next) {
  try {
    if (!this.magazineId) {
      this.magazineId = await nextPublicId("magazineId", "MG");
    }

    next();
  } catch (error) {
    next(error);
  }
});

magazineSchema.index(
  { slug: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Magazine = mongoose.model("Magazine", magazineSchema, "articles");

module.exports = Magazine;
