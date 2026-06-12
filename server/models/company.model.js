const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const baseSchema = require("./baseSchema.model");

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, trim: true, default: "" },
    label: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxLength: [120, "Company name must be at most 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxLength: [1000, "Description must be at most 1000 characters"],
    },
    website: {
      type: String,
      trim: true,
      default: "",
      maxLength: [250, "Website must be at most 250 characters"],
    },
    socialLinks: [socialLinkSchema],
    country: {
      type: String,
      trim: true,
      default: "",
      maxLength: [80, "Country must be at most 80 characters"],
    },
    foundedYear: {
      type: Number,
      default: null,
      min: [1900, "Founded year is invalid"],
      max: [2100, "Founded year is invalid"],
    },
    type: {
      type: String,
      enum: ["developer", "publisher", "developer_publisher"],
      default: "developer_publisher",
    },
    icon: {
      type: ObjectId,
      ref: "Icon",
      default: null,
    },
    logo: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
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

companySchema.index(
  { name: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
