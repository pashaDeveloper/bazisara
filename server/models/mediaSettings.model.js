const mongoose = require("mongoose");

module.exports = mongoose.model("MediaSettings", new mongoose.Schema({
  _id: { type: String, default: "image-preview" },
  blurAmount: { type: Number, min: 0, max: 40, default: 12 },
  quality: { type: Number, min: 1, max: 100, default: 35 },
  maxDimension: { type: Number, min: 16, max: 256, default: 64 },
  hashEnabled: { type: Boolean, default: true },
  hashComponentsX: { type: Number, min: 1, max: 9, default: 4 },
  hashComponentsY: { type: Number, min: 1, max: 9, default: 3 },
}, { timestamps: true }));
