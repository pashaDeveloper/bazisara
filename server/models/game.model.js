const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const baseSchema = require("./baseSchema.model");

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    public_id: { type: String, default: "" },
    type: { type: String, enum: ["image", "video"], default: "image" },
  },
  { _id: false }
);

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, trim: true, default: "" },
    label: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Game title is required"],
      trim: true,
      maxLength: [150, "Game title must be at most 150 characters"],
    },
    slug: {
      type: String,
      required: [true, "Game slug is required"],
      trim: true,
      lowercase: true,
      maxLength: [180, "Game slug must be at most 180 characters"],
    },
    shortDescription: {
      type: String,
      trim: true,
      default: "",
      maxLength: [350, "Short description must be at most 350 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: ObjectId,
      ref: "Category",
      required: [true, "Game category is required"],
    },
    genres: [
      {
        type: ObjectId,
        ref: "Genre",
      },
    ],
    developers: [
      {
        type: ObjectId,
        ref: "Company",
      },
    ],
    publishers: [
      {
        type: ObjectId,
        ref: "Company",
      },
    ],
    tags: [
      {
        type: ObjectId,
        ref: "Tag",
      },
    ],
    platforms: [{ type: String, trim: true }],
    gameModes: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    regions: [{ type: String, trim: true }],
    launcher: {
      type: String,
      trim: true,
      default: "",
    },
    edition: {
      type: String,
      trim: true,
      default: "استاندارد",
    },
    releaseDate: {
      type: Date,
      default: null,
    },
    officialWebsite: {
      type: String,
      trim: true,
      default: "",
    },
    socialLinks: [socialLinkSchema],
    ageRating: {
      type: String,
      trim: true,
      default: "",
    },
    gameplayTime: {
      type: String,
      trim: true,
      default: "",
    },
    metacriticScore: {
      type: Number,
      default: null,
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot be more than 100"],
    },
    cover: mediaSchema,
    gallery: [mediaSchema],
    trailerUrl: {
      type: String,
      trim: true,
      default: "",
    },
    trailerVideo: mediaSchema,
    gameplayVideo: mediaSchema,
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
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

gameSchema.index(
  { slug: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
