const mongoose = require("mongoose");
const MediaSettings = require("../models/mediaSettings.model");

const defaults = Object.freeze({
  blurAmount: 12, quality: 35, maxDimension: 64,
  hashEnabled: true, hashComponentsX: 4, hashComponentsY: 3,
});
const ranges = {
  blurAmount: [0, 40], quality: [1, 100], maxDimension: [16, 256],
  hashComponentsX: [1, 9], hashComponentsY: [1, 9],
};
let cached;
let expiresAt = 0;

function normalizeMediaSettings(input = {}, base = defaults) {
  const result = { ...base };
  for (const [field, [min, max]] of Object.entries(ranges)) {
    if (input[field] === undefined) continue;
    const value = input[field];
    if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
      const error = new Error(`مقادیر تنظیمات تصویر باید عدد صحیح در بازه مجاز (${min} تا ${max}) باشند`);
      error.statusCode = 400;
      throw error;
    }
    result[field] = value;
  }
  if (input.hashEnabled !== undefined) {
    if (typeof input.hashEnabled !== "boolean") {
      const error = new Error("وضعیت تولید هش معتبر نیست");
      error.statusCode = 400;
      throw error;
    }
    result.hashEnabled = input.hashEnabled;
  }
  return result;
}

async function getMediaSettings() {
  if (mongoose.connection.readyState !== 1) return { ...defaults };
  if (cached && expiresAt > Date.now()) return { ...cached };
  const saved = await MediaSettings.findById("image-preview").lean();
  cached = normalizeMediaSettings(saved || {});
  expiresAt = Date.now() + 30000;
  return { ...cached };
}

async function updateMediaSettings(input) {
  const settings = normalizeMediaSettings(input, await getMediaSettings());
  await MediaSettings.findByIdAndUpdate("image-preview", { $set: settings }, { upsert: true, runValidators: true });
  cached = settings;
  expiresAt = Date.now() + 30000;
  return { ...settings };
}

module.exports = { defaults, getMediaSettings, normalizeMediaSettings, updateMediaSettings };
