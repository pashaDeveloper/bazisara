const mongoose = require("mongoose");
const baseSchema = require("./baseSchema.model");

const gameKeywordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Keyword name is required"],
      trim: true,
      maxLength: [100, "Keyword name must be at most 100 characters"],
    },
    title_en: {
      type: String,
      trim: true,
      default: "",
      maxLength: [140, "English title must be at most 140 characters"],
    },
    slug: {
      type: String,
      required: [true, "Keyword slug is required"],
      trim: true,
      lowercase: true,
      maxLength: [140, "Keyword slug must be at most 140 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxLength: [1000, "Description must be at most 1000 characters"],
    },
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
      storage: {
        type: String,
        enum: ["", "cloudinary", "arvan", "local"],
        default: "",
      },
    },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

gameKeywordSchema.index(
  { slug: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = mongoose.model("GameKeyword", gameKeywordSchema);
