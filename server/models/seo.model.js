const mongoose = require("mongoose");
const baseSchema = require("./baseSchema.model");

const seoSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: [{ type: String, trim: true }],
    ...baseSchema.obj,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seo", seoSchema);
