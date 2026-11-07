const Counter = require("../models/counter");
const { randomInt } = require("crypto");
const PublicIdReservation = require("../models/publicIdReservation.model");

const PUBLIC_ID_WIDTH = 6;
const RANDOM_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomPublicId(prefix) {
  return `${prefix}${Array.from({ length: 5 }, () => RANDOM_ID_ALPHABET[randomInt(RANDOM_ID_ALPHABET.length)]).join("")}`;
}

function isRandomPublicId(value, prefix) {
  return new RegExp(`^${prefix}[a-z0-9]{5}$`).test(String(value || ""));
}

async function nextRandomPublicId(prefix, Model, field) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const id = randomPublicId(prefix);
    try {
      // MongoDB's unique _id reserves the code across simultaneous uploads and saves.
      await PublicIdReservation.create({ _id: id });
    } catch (error) {
      if (error.code === 11000) continue;
      throw error;
    }
    if (Model && await Model.exists({ $or: [{ [field]: id }, { legacyPublicIds: id }] })) continue;
    return id;
  }
  throw new Error("Could not reserve a unique public ID");
}

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

async function nextDashedPublicId(counterName, prefix, startAt = 1) {
  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `${String(prefix || "").trim().toLowerCase()}-${Number(startAt) + Number(counter.seq || 0) - 1}`;
}

module.exports = {
  randomPublicId,
  isRandomPublicId,
  nextRandomPublicId,
  formatPublicId,
  nextDashedPublicId,
  nextPublicId,
  publicIdOrLegacyFilters,
  publicIdPattern,
};
