const mongoose = require("mongoose");
const baseSchema = require("./baseSchema.model");

const badgeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    tone: { type: String, enum: ["green", "orange", "red", "blue"], default: "green" },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Badge", badgeSchema);
