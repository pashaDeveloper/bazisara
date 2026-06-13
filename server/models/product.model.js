const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Counter = require("./counter");
const baseSchema = require("./baseSchema.model");
const { generateSlug, normalizePersianSlug, translateToEnglish } = require("../utils/seoUtils");

const urlListSchema = new mongoose.Schema(
  {
    url: [{ type: String }],
    webp_url: [{ type: String }],
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productId: { type: Number, unique: true },
    title: { type: String, required: true, trim: true },
    title_en: { type: String, trim: true },
    summary: { type: String, required: true, default: "" },
    url: {
      uri_en: { type: String, unique: true, sparse: true },
      uri_fa: { type: String, unique: true, sparse: true },
    },
    statusProduct: {
      type: String,
      enum: ["marketable", "unavailable", "out_of_stock"],
      required: true,
      default: "marketable",
    },
    has_quick_view: { type: Boolean, default: false },
    product_type: { type: String, default: "product" },
    category: { type: ObjectId, ref: "Category", required: true },
    brand: { type: ObjectId, ref: "Brand", required: true },
    images: {
      main: urlListSchema,
      list: [urlListSchema],
    },
    variants: [{ type: ObjectId, ref: "Variant", required: true }],
    default_variant: { type: ObjectId, ref: "Variant" },
    second_default_variant: { type: ObjectId, ref: "Variant" },
    specifications: [{ type: ObjectId, ref: "Specification", required: true }],
    warranties: [{ type: ObjectId, ref: "Warranty" }],
    insurances: [{ type: ObjectId, ref: "Insurance" }],
    price: { type: ObjectId, ref: "Price" },
    shipping_methods: [{ type: ObjectId, ref: "ShippingMethod" }],
    comments: [{ type: ObjectId, ref: "Comment" }],
    questions: [{ type: ObjectId, ref: "Question" }],
    rating: {
      rate: { type: Number, required: true, default: 0 },
      count: { type: Number, required: true, default: 0 },
    },
    pros_and_cons: [{ type: String }],
    suggestion: {
      count: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
    },
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    product_badges: [{ type: ObjectId, ref: "Badge" }],
    technoPlus: { type: ObjectId, ref: "DigiPlus", required: true },
    has_size_guide: { type: Boolean, default: false },
    has_true_to_size: { type: Boolean, default: false },
    show_type: { type: String, default: "normal" },
    has_offline_shop_stock: { type: Boolean, default: false },
    expert_reviews: {
      description: { type: String, default: "" },
      short_review: { type: String, default: "" },
      technical_properties: [{ type: String }],
    },
    intrack: {
      eventName: { type: String },
      eventData: {
        currency: { type: String },
        deviceType: { type: String },
        name: { type: String },
        productId: { type: Number },
        productImageUrl: [{ type: String }],
        leafCategory: { type: String },
        unitPrice: { type: Number },
        url: { type: String },
        supplyCategory: { type: String },
        categoryLevel1: { type: String },
        categoryLevel2: { type: String },
        categoryLevel3: { type: String },
        categoryLevel4: { type: String },
        categoryLevel5: { type: String },
      },
    },
    promotion_banner: [{ type: String }],
    bigdata_tracker_data: {
      page_name: { type: String },
      page_info: { product_id: { type: Number } },
    },
    seo: { type: ObjectId, ref: "Seo" },
    creator: { type: ObjectId, ref: "Admin" },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

productSchema.pre("save", async function (next) {
  try {
    if (!this.productId) {
      const counter = await Counter.findOneAndUpdate({ name: "productId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      this.productId = counter.seq;
    }

    if (!this.title_en && this.title) this.title_en = await translateToEnglish(this.title);
    const slugEn = await generateSlug(this.title_en || this.title);
    const slugFa = normalizePersianSlug(this.title);

    if (!this.url?.uri_en) this.url = { ...this.url, uri_en: `/products/${this.productId}/${slugEn}` };
    if (!this.url?.uri_fa) this.url = { ...this.url, uri_fa: `/products/${this.productId}/${slugFa}` };

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Product", productSchema);
