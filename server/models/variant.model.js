const mongoose = require("mongoose");
const baseSchema = require("./baseSchema.model");

const payloadSchema = new mongoose.Schema(
  {
    text: { type: String, default: "" },
    text_color: { type: String, default: "#ffffff" },
    svg_icon: { type: String, default: null },
  },
  { _id: false }
);

const variantBadgeSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    type: {
      type: String,
      enum: ["special_sell", "best_price", "incredible", "new_arrival", "limited_offer"],
      default: "special_sell",
    },
    slot: {
      type: String,
      enum: ["topRightCorner", "topLeftCorner", "bottomRightCorner", "bottomLeftCorner"],
      default: "topRightCorner",
    },
    payload: payloadSchema,
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    basePrice: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    oldPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    color: { type: String, trim: true, default: "" },
    priceModifiers: [
      {
        categoryFilter: { type: mongoose.Schema.Types.ObjectId, ref: "CategoryFilter", default: null },
        filterKey: { type: String, trim: true, default: "" },
        filterLabel: { type: String, trim: true, default: "" },
        optionValue: { type: String, trim: true, default: "" },
        optionLabel: { type: String, trim: true, default: "" },
        priceDelta: { type: Number, default: 0 },
      },
    ],
    variant_badges: [variantBadgeSchema],
    ...baseSchema.obj,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Variant", variantSchema);
