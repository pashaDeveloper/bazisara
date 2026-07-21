const Counter = require("../models/counter");

const PUBLIC_ID_WIDTH = 6;

function formatPublicId(prefix, seq) {
  return `${prefix}${String(Number(seq) || 0).padStart(PUBLIC_ID_WIDTH, "0")}`;
}

function publicIdPattern(prefix) {
  return new RegExp(`^${prefix}\\d{${PUBLIC_ID_WIDTH}}$`, "i");
}

function publicIdOrLegacyFilters(field, value, prefix) {
  const id = String(value || "").trim();
  const filters = [];

  if (publicIdPattern(prefix).test(id)) {
    filters.push({ [field]: id.toUpperCase() });
  }

  if (/^\d+$/.test(id)) {
    filters.push({ [field]: formatPublicId(prefix, id) });
    filters.push({ [field]: Number(id) });
  }

  return filters;
}

async function nextPublicId(counterName, prefix) {
  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return formatPublicId(prefix, counter.seq);
}

module.exports = {
  formatPublicId,
  nextPublicId,
  publicIdOrLegacyFilters,
  publicIdPattern,
};
