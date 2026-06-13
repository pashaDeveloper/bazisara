const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Counter = require("./counter");
const baseSchema = require("./baseSchema.model");
const { generateSlug, normalizePersianSlug, translateToEnglish } = require("../utils/seoUtils");

const warrantySchema = new mongoose.Schema(
  {
    ...baseSchema.obj,
    warrantyId: { type: Number, unique: true },
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
    duration_months: { type: Number, required: true },
    provider: { type: ObjectId, ref: "WarrantyCompany", required: true },
    coverage: [{ type: String }],
    exclusions: [{ type: String }],
    conditions: [{ type: String }],
    refund_policy: [{ type: String }],
    activation_method: [{ type: String }],
    global_discount_percent: { type: Number, default: 0, min: 0, max: 100 },
    customer: { type: ObjectId, ref: "User" },
    status: { type: String, enum: ["active", "expired", "void", "pending"], default: "pending" },
    creator: { type: ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

warrantySchema.pre("save", async function (next) {
  try {
    if (!this.title_en && this.title_fa) this.title_en = await translateToEnglish(this.title_fa);
    if (!this.slug_fa && this.title_fa) this.slug_fa = normalizePersianSlug(this.title_fa);
    if (!this.slug_en && this.title_fa) this.slug_en = await generateSlug(this.title_fa);
    if (!this.warrantyId) {
      const counter = await Counter.findOneAndUpdate({ name: "warrantyId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      this.warrantyId = counter.seq;
    }
    if (!this.url?.uri_en) this.url = { ...this.url, uri_en: `/warranty/${this.slug_en}` };
    if (!this.url?.uri_fa && this.slug_fa) this.url = { ...this.url, uri_fa: `/warranty/${this.slug_fa}` };
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Warranty", warrantySchema);
