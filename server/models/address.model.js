const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const baseSchema = require("./baseSchema.model");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
      default: null
    },
    admin: {
      type: ObjectId,
      ref: "Admin",
      default: null
    },
    province: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    address: {
      type: String
    },
    plateNumber: { 
      type: Number,
    },
    postalCode: {
      type: Number,
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    isComplete: {
      type: Boolean,
      default: false
    },
    ...baseSchema.obj
  },
  { timestamps: true }
);

// بررسی کامل بودن قبل از ذخیره
addressSchema.pre("save", function (next) {
  const hasOwner = Boolean(this.user || this.admin);
  if (!hasOwner) {
    return next(new Error("Address must belong to a user or an admin"));
  }

  const allFilled =
    typeof this.province === "string" &&
    this.province.trim().length > 0 &&
    typeof this.city === "string" &&
    this.city.trim().length > 0 &&
    typeof this.address === "string" &&
    this.address.trim().length > 0 &&
    Number.isFinite(this.plateNumber) &&
    Number.isFinite(this.postalCode);

  this.isComplete = allFilled;
  next();
});

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;
