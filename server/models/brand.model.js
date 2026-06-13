const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Counter = require("./counter");
const baseSchema = require("./baseSchema.model");
const { generateSlug, normalizePersianSlug, translateToEnglish } = require("../utils/seoUtils");

const brandSchema = new mongoose.Schema(
  {
    brandId: { type: String, unique: true },
    code: { type: String, required: true, trim: true },
    title_fa: { type: String, required: true, unique: true, trim: true },
    title_en: { type: String, trim: true },
    slug_fa: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      default: function () {
        return normalizePersianSlug(this.title_fa);
      },
    },
    slug_en: { type: String, unique: true, sparse: true, index: true },
    url: {
      uri_en: { type: String, unique: true, sparse: true },
      uri_fa: { type: String, unique: true, sparse: true },
    },
    visibility: { type: Boolean, default: true },
    website: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    foundedYear: { type: Number, default: null },
    rate: { type: Number, min: 0, max: 5, default: 0 },
    logo: {
      url: { type: String, default: "https://placehold.co/296x200.png" },
      public_id: { type: String, default: "N/A" },
    },
    tags: [{ type: ObjectId, ref: "Tag" }],
    is_premium: { type: Boolean, default: false },
    is_miscellaneous: { type: Boolean, default: false },
    is_name_similar: { type: Boolean, default: false },
    is_international: { type: Boolean, default: false },
    creator: { type: ObjectId, ref: "Admin" },
    description: { type: String, default: "" },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

brandSchema.pre("save", async function (next) {
  try {
    if (!this.title_en && this.title_fa) this.title_en = await translateToEnglish(this.title_fa);
    if (!this.slug_fa && this.title_fa) this.slug_fa = normalizePersianSlug(this.title_fa);
    if (!this.slug_en && this.title_fa) this.slug_en = await generateSlug(this.title_fa);

    if (!this.brandId) {
      const counter = await Counter.findOneAndUpdate({ name: "brandId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      this.brandId = `tsb-${counter.seq}`;
    }

    if (!this.url?.uri_en) this.url = { ...this.url, uri_en: `/brand/${this.brandId}/${this.slug_en}` };
    if (!this.url?.uri_fa && this.slug_fa) this.url = { ...this.url, uri_fa: `/brand/${this.brandId}/${this.slug_fa}` };
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Brand", brandSchema);
