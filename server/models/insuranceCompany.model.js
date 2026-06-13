const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Counter = require("./counter");
const baseSchema = require("./baseSchema.model");
const { generateSlug, normalizePersianSlug, translateToEnglish } = require("../utils/seoUtils");

const insuranceCompanySchema = new mongoose.Schema(
  {
    companyId: { type: Number, unique: true },
    name_fa: { type: String, required: true, unique: true, trim: true },
    name_en: { type: String, trim: true },
    slug_fa: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      default: function () {
        return normalizePersianSlug(this.name_fa);
      },
    },
    slug_en: { type: String, unique: true, sparse: true, index: true },
    logo: {
      url: { type: String, default: "https://placehold.co/296x200.png", required: true },
      public_id: { type: String, default: "N/A" },
    },
    rating: {
      total_rate: { type: Number, default: 0 },
      total_count: { type: Number, default: 0 },
      commitment: { type: Number, default: 0 },
      no_return: { type: Number, default: 0 },
      on_time_shipping: { type: Number, default: 0 },
    },
    contact: {
      phone: { type: String, trim: true },
      website: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    addresses: [{ type: ObjectId, ref: "Address" }],
    description: { type: String, default: "" },
    is_international: { type: Boolean, default: false },
    is_trusted: { type: Boolean, default: false },
    is_official: { type: Boolean, default: false },
    is_new: { type: Boolean, default: false },
    solvency_level: { type: Number, default: null },
    regulatory_body: { type: String, default: "" },
    customer_satisfaction_rate: { type: Number, default: null },
    claim_settlement_rate: { type: Number, default: null },
    visibility: { type: Boolean, default: true },
    license_number: { type: String, match: /^[A-Z0-9-]{8,12}$/ },
    creator: { type: ObjectId, ref: "Admin" },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

insuranceCompanySchema.pre("save", async function (next) {
  try {
    if (!this.name_en && this.name_fa) this.name_en = await translateToEnglish(this.name_fa);
    if (!this.slug_fa && this.name_fa) this.slug_fa = normalizePersianSlug(this.name_fa);
    if (!this.slug_en && this.name_fa) this.slug_en = await generateSlug(this.name_fa);
    if (!this.companyId) {
      const counter = await Counter.findOneAndUpdate({ name: "insuranceCompanyId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      this.companyId = counter.seq;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("InsuranceCompany", insuranceCompanySchema);
