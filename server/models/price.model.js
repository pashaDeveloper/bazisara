const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Counter = require("./counter");
const baseSchema = require("./baseSchema.model");

const priceSchema = new mongoose.Schema(
  {
    priceId: { type: Number, unique: true },
    selling_price: { type: Number, required: true },
    rrp_price: { type: Number, required: true },
    order_limit: { type: Number, required: true },
    is_incredible: { type: Boolean, required: true, default: false },
    is_promotion: { type: Boolean, required: true, default: false },
    is_locked_for_techplus: { type: Boolean, required: true, default: false },
    bnpl_active: { type: Boolean, required: true, default: false },
    marketable_stock: { type: Number, default: null },
    discount_percent: { type: Number, required: true, default: 0 },
    is_plus_early_access: { type: Boolean, required: true, default: false },
    creator: { type: ObjectId, ref: "Admin" },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

priceSchema.pre("save", async function (next) {
  try {
    if (!this.priceId) {
      const counter = await Counter.findOneAndUpdate({ name: "priceId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      this.priceId = counter.seq;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Price", priceSchema);
