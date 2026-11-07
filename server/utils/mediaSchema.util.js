function createBlurFields() {
  return {
    hash: { type: String, default: "" },
    public_id: { type: String, default: "" },
    url: { type: String, default: "" },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    quality: { type: Number, default: null },
    blurAmount: { type: Number, default: null },
  };
}

module.exports = { createBlurFields };
