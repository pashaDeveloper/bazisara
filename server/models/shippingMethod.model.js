const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Counter = require("./counter");
const baseSchema = require("./baseSchema.model");

const shippingMethodSchema = new mongoose.Schema(
  {
    shippingMethodId: { type: Number, unique: true },
    title_fa: { type: String, required: true, unique: true, trim: true },
    title_en: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, default: 0 },
    estimated_days: { type: Number, default: 0 },
    provider: { type: String, trim: true, default: "" },
    is_express: { type: Boolean, default: false },
    visibility: { type: Boolean, default: true },
    creator: { type: ObjectId, ref: "Admin" },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

shippingMethodSchema.pre("save", async function (next) {
  try {
    if (!this.shippingMethodId) {
      const counter = await Counter.findOneAndUpdate({ name: "shippingMethodId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      this.shippingMethodId = counter.seq;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("ShippingMethod", shippingMethodSchema);
