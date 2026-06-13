const mongoose = require("mongoose");
const baseSchema = require("./baseSchema.model");

const digiPlusSchema = new mongoose.Schema(
  {
    title: { type: String, default: "تکنو پلاس" },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DigiPlus", digiPlusSchema);
