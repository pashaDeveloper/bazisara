const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const baseSchema = require("./baseSchema.model");

const collectionGameSchema = new mongoose.Schema(
  {
    game: { type: ObjectId, ref: "Game", required: true },
    sortOrder: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const gameCollectionSchema = new mongoose.Schema(
  {
    title_fa: { type: String, required: true, trim: true, maxLength: 140 },
    title_en: { type: String, trim: true, default: "", maxLength: 140 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxLength: 160 },
    description: { type: String, trim: true, default: "" },
    placement: { type: String, trim: true, default: "homepage" },
    order: { type: Number, default: 0 },
    games: [collectionGameSchema],
    visibility: { type: Boolean, default: true },
    creator: { type: ObjectId, ref: "Admin", default: null },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameCollection", gameCollectionSchema);
