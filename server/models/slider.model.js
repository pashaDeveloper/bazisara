const mongoose = require("mongoose");
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
  },
  { _id: false }
);

const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Slider title is required"],
      trim: true,
      maxLength: [160, "Slider title must be at most 160 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
      maxLength: [320, "Slider subtitle must be at most 320 characters"],
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    image: mediaSchema,
    ...baseSchema.obj,
  },
  { timestamps: true }
);

const Slider = mongoose.model("Slider", sliderSchema);

module.exports = Slider;
