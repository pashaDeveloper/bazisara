const mongoose = require("mongoose");
const baseSchema = require("./baseSchema.model");

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    public_id: { type: String, default: "" },
    storage: {
      type: String,
      enum: ["", "cloudinary", "arvan", "local"],
      default: "",
    },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true, default: "" },
    answer: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      maxLength: [180, "Article title must be at most 180 characters"],
    },
    slug: {
      type: String,
      required: [true, "Article slug is required"],
      trim: true,
      lowercase: true,
      maxLength: [220, "Article slug must be at most 220 characters"],
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

articleSchema.index(
  { slug: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
