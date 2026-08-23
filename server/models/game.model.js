const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const baseSchema = require("./baseSchema.model");
const { nextDashedPublicId } = require("../utils/publicId.util");

const mediaSchema = new mongoose.Schema(
  {
    blur: {
      hash: { type: String, default: "" },
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
      width: { type: Number, default: null },
      height: { type: Number, default: null },
      quality: { type: Number, default: null },
      blurAmount: { type: Number, default: null },
    },
    mobile: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
      width: { type: Number, default: null },
      height: { type: Number, default: null },
    },
    position: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
    },
    alt: { type: String, trim: true, default: "" },
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

const reviewItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    link: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const ratingBreakdownSchema = new mongoose.Schema(
  {
    score: { type: Number, default: null },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const starRatingSchema = new mongoose.Schema(
  {
    total: { type: String, trim: true, default: "" },
    score: { type: String, trim: true, default: "" },
    count: [ratingBreakdownSchema],
  },
  { _id: false }
);

function normalizePersianDigits(value) {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function parseSizeMb(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const raw = normalizePersianDigits(value).trim();
  const matches = raw.match(/[\d,.]+/g);
  if (!matches?.length) return null;

  const numeric = Number(matches[matches.length - 1].replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return null;

  return /gb|gib|گیگ|گيگ/i.test(raw) ? numeric * 1024 : numeric;
}

const platformSizeSchema = new mongoose.Schema(
  {
    platform: { type: ObjectId, ref: "Platform", default: null },
    variant: { type: String, trim: true, default: "" },
    size: { type: Number, default: null, set: parseSizeMb },
  },
  { _id: false }
);

const downloadPartSchema = new mongoose.Schema(
  {
    externalId: { type: String, trim: true, default: "" },
    partNumber: { type: Number, default: null },
    fileName: { type: String, trim: true, default: "" },
    contentType: { type: String, trim: true, default: "" },
    size: { type: Number, default: null, set: parseSizeMb },
    hash: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const platformDownloadLinkSchema = new mongoose.Schema(
  {
    platform: { type: ObjectId, ref: "Platform", default: null },
    platformTitle: { type: String, trim: true, default: "" },
    platformDescription: { type: String, trim: true, default: "" },
    titleId: { type: String, trim: true, default: "" },
    region: { type: String, trim: true, default: "" },
    regionDescription: { type: String, trim: true, default: "" },
    version: { type: String, trim: true, default: "" },
    size: { type: Number, default: null, set: parseSizeMb },
    downloadUrl: { type: String, trim: true, default: "" },
    sourceUrl: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    parts: [downloadPartSchema],
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

const searchTitleSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    slug: { type: String, trim: true, lowercase: true, default: "" },
  },
  { _id: false }
);

const ageRatingSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, default: "" },
    title_fa: { type: String, trim: true, default: "" },
    title_en: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const offlinePlayerSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, default: "" },
    title_fa: { type: String, trim: true, default: "" },
    title_en: { type: String, trim: true, default: "" },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
  },
  { _id: false }
);

const gameFilterValueSchema = new mongoose.Schema(
  {
    priceMin: { type: Number, default: null },
    priceMax: { type: Number, default: null },
    sizeMinGb: { type: Number, default: null },
    sizeMaxGb: { type: Number, default: null },
    ageRatings: [{ type: String, trim: true }],
    genres: [{ type: ObjectId, ref: "Genre" }],
    gameModes: [{ type: String, trim: true }],
    offlinePlayers: [{ type: String, trim: true }],
  },
  { _id: false }
);

const dlcSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    type: { type: String, trim: true, default: "" },
    image: mediaSchema,
    versionSize: { type: Number, default: null, set: parseSizeMb },
  },
  { _id: false }
);

const extraEditionItemSchema = new mongoose.Schema(
  {
    platform: { type: ObjectId, ref: "Platform", default: null },
    capacityType: { type: String, trim: true, default: "" },
    price: { type: Number, default: null, min: [0, "Price cannot be negative"] },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountedPrice: { type: Number, default: null, min: [0, "Discounted price cannot be negative"] },
  },
  { _id: false }
);

const extraEditionSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    versionTitles: { type: String, trim: true, default: "" },
    versionSize: { type: String, trim: true, default: "" },
    items: [extraEditionItemSchema],
    image: mediaSchema,
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    gameId: { type: String, unique: true, sparse: true },
    title: {
      type: String,
      required: [true, "Game title is required"],
      trim: true,
      maxLength: [150, "Game title must be at most 150 characters"],
    },
    summary: {
      type: String,
      trim: true,
      default: "",
      maxLength: [160, "Game summary must be at most 160 characters"],
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
      default: undefined,
      maxLength: [5000, "Short description must be at most 5000 characters"],
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
    showGenresInCategories: {
      type: Boolean,
      default: false,
    },
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
    gameKeywords: [{ type: ObjectId, ref: "GameKeyword" }],
    searchTitles: [searchTitleSchema],
    filterValues: gameFilterValueSchema,
    collections: [{ type: ObjectId, ref: "GameCollection" }],
    platforms: [{ type: ObjectId, ref: "Platform" }],
    platformReleases: [platformReleaseSchema],
    platformSizes: [platformSizeSchema],
    platformDownloadLinks: [platformDownloadLinkSchema],
    gameModes: [{ type: String, trim: true }],
    offlinePlayers: [offlinePlayerSchema],
    onlinePlayers: [{ type: String, trim: true }],
    onlinePlayerCount: {
      type: String,
      trim: true,
      default: "",
    },
    multiplayerPlayerCount: {
      type: String,
      trim: true,
      default: "",
    },
    relatedGames: [{ type: ObjectId, ref: "Game" }],
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
    hasFreePersianSubtitle: {
      type: Boolean,
      default: false,
    },
    hasPaidPersianSubtitle: {
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
    ageRating: ageRatingSchema,
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
    sonyScore: {
      type: Number,
      default: null,
      min: [0, "Score cannot be negative"],
      max: [5, "Score cannot be more than 5"],
    },
    steamScore: {
      type: Number,
      default: null,
      min: [0, "Score cannot be negative"],
      max: [5, "Score cannot be more than 5"],
    },
    xboxScore: {
      type: Number,
      default: null,
      min: [0, "Score cannot be negative"],
      max: [5, "Score cannot be more than 5"],
    },
    starRating: starRatingSchema,
    steamRating: starRatingSchema,
    xboxRating: starRatingSchema,
    playstationTitleId: {
      type: String,
      trim: true,
      default: "",
      maxLength: [120, "PlayStation Title ID must be at most 120 characters"],
    },
    playstationNpCommunicationId: {
      type: String,
      trim: true,
      default: "",
      maxLength: [40, "PlayStation NP Communication ID must be at most 40 characters"],
    },
    cover: mediaSchema,
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
    showOnlyInCollections: {
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

function coerceLegacyGameSizeFields(data) {
  if (!data || typeof data !== "object") return;

  if (Array.isArray(data.platformSizes)) {
    data.platformSizes.forEach((item) => {
      if (item && Object.prototype.hasOwnProperty.call(item, "size")) item.size = parseSizeMb(item.size);
    });
  }

  if (Array.isArray(data.platformDownloadLinks)) {
    data.platformDownloadLinks.forEach((item) => {
      if (!item) return;
      if (Object.prototype.hasOwnProperty.call(item, "size")) item.size = parseSizeMb(item.size);
      if (Array.isArray(item.parts)) {
        item.parts.forEach((part) => {
          if (part && Object.prototype.hasOwnProperty.call(part, "size")) part.size = parseSizeMb(part.size);
        });
      }
    });
  }

  if (Array.isArray(data.dlcs)) {
    data.dlcs.forEach((item) => {
      if (item && Object.prototype.hasOwnProperty.call(item, "versionSize")) item.versionSize = parseSizeMb(item.versionSize);
    });
  }
}

gameSchema.pre("init", function (data) {
  coerceLegacyGameSizeFields(data);
});

gameSchema.pre("save", async function (next) {
  try {
    coerceLegacyGameSizeFields(this);

    if (!this.gameId) {
      this.gameId = await nextDashedPublicId("gameIdBb", "bb", 1026);
    }

    next();
  } catch (error) {
    next(error);
  }
});

gameSchema.virtual("hasOnlineMode").get(function () {
  return Boolean(String(this.onlinePlayerCount || "").trim() || (Array.isArray(this.onlinePlayers) && this.onlinePlayers.length));
});

gameSchema.virtual("hasMultiplayerMode").get(function () {
  return Boolean(String(this.multiplayerPlayerCount || "").trim());
});

gameSchema.set("toJSON", { virtuals: true });
gameSchema.set("toObject", { virtuals: true });

gameSchema.index(
  { slug: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
