const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
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

const reviewItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    link: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const platformSizeSchema = new mongoose.Schema(
  {
    platform: { type: ObjectId, ref: "Platform", default: null },
    variant: { type: String, trim: true, default: "" },
    size: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const platformReleaseSchema = new mongoose.Schema(
  {
    platform: { type: ObjectId, ref: "Platform", default: null },
    releaseDate: { type: Date, default: null },
  },
  { _id: false }
);

const dlcSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    type: { type: String, trim: true, default: "" },
    image: mediaSchema,
    versionSize: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const extraEditionSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    versionSize: { type: String, trim: true, default: "" },
    image: mediaSchema,
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
    reviewSiteTitle: {
      type: String,
      trim: true,
      default: "",
    },
    reviewSource: {
      type: String,
      trim: true,
      default: "",
    },
    reviewLink: {
      type: String,
      trim: true,
      default: "",
    },
    reviewItems: [reviewItemSchema],
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
    collections: [{ type: ObjectId, ref: "GameCollection" }],
    platforms: [{ type: ObjectId, ref: "Platform" }],
    platformReleases: [platformReleaseSchema],
    platformSizes: [platformSizeSchema],
    gameModes: [{ type: String, trim: true }],
    offlinePlayers: [{ type: String, trim: true }],
    onlinePlayers: [{ type: String, trim: true }],
    launcher: [{ type: String, trim: true }],
    edition: {
      type: String,
      trim: true,
      default: "استاندارد",
    },
    hasDubbing: {
      type: Boolean,
      default: false,
    },
    hasSubtitle: {
      type: Boolean,
      default: false,
    },
    dlcs: [dlcSchema],
    extraEditions: [extraEditionSchema],
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
    reviewSiteTitle: {
      type: String,
      trim: true,
      default: "",
    },
    reviewSource: {
      type: String,
      trim: true,
      default: "",
    },
    reviewLink: {
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
    cardDesktopCover: mediaSchema,
    cardMobileCover: mediaSchema,
    desktopCover: mediaSchema,
    mobileCover: mediaSchema,
    gallery: [mediaSchema],
    trailerVideo: mediaSchema,
    trailerThumbnail: mediaSchema,
    patchTitle: {
      type: String,
      trim: true,
      default: "",
    },
    patchImage: mediaSchema,
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

gameSchema.index(
  { slug: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
