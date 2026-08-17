const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Article = require("../models/article.model");
const Counter = require("../models/counter");
const Product = require("../models/product.model");
const { formatPublicId, publicIdPattern } = require("../utils/publicId.util");

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.DB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

function extractSeq(value, prefix) {
  if (value === undefined || value === null || value === "") return 0;
  const text = String(value).trim();
  const match = text.match(publicIdPattern(prefix));
  if (match) return Number(text.slice(prefix.length));
  return /^\d+$/.test(text) ? Number(text) : 0;
}

function updateProductUrls(doc, publicId) {
  const updates = {};
  const productPathPattern = /(\/products\/)(?:[A-Z]{2})?\d{1,6}(\/)/i;

  for (const key of ["uri_en", "uri_fa"]) {
    const current = doc.url?.[key];
    if (typeof current !== "string" || !current) continue;

    const next = current.replace(productPathPattern, `$1${publicId}$2`);
    if (next !== current) updates[`url.${key}`] = next;
  }

  return updates;
}

async function backfillModel({ Model, field, counterName, prefix }) {
  const [counter, docs] = await Promise.all([
    Counter.findOne({ name: counterName }).lean(),
    Model.find({})
      .sort({ createdAt: 1, _id: 1 })
      .select(`_id ${field} url createdAt`)
      .lean(),
  ]);

  const usedPublicIds = new Set();
  let nextSeq = Number(counter?.seq || 0);

  for (const doc of docs) {
    const seq = extractSeq(doc[field], prefix);
    if (seq > nextSeq) nextSeq = seq;

    const value = String(doc[field] || "").trim();
    if (publicIdPattern(prefix).test(value)) {
      usedPublicIds.add(value.toUpperCase());
    }
  }

  let changed = 0;

  function nextUnusedPublicId() {
    do {
      nextSeq += 1;
    } while (usedPublicIds.has(formatPublicId(prefix, nextSeq)));

    const publicId = formatPublicId(prefix, nextSeq);
    usedPublicIds.add(publicId);
    return publicId;
  }

  for (const doc of docs) {
    const current = String(doc[field] || "").trim();
    const alreadyFormatted = publicIdPattern(prefix).test(current);
    let publicId = alreadyFormatted ? current.toUpperCase() : "";

    if (!publicId) {
      const seq = extractSeq(doc[field], prefix);
      const convertedPublicId = seq > 0 ? formatPublicId(prefix, seq) : "";
      publicId = convertedPublicId && !usedPublicIds.has(convertedPublicId) ? convertedPublicId : nextUnusedPublicId();
      usedPublicIds.add(publicId);
    }

    const $set = {
      ...(alreadyFormatted ? {} : { [field]: publicId }),
      ...(Model.modelName === "Product" ? updateProductUrls(doc, publicId) : {}),
    };

    if (!Object.keys($set).length) continue;

    await Model.updateOne({ _id: doc._id }, { $set });
    changed += 1;
    console.log(`[public-ids] ${Model.modelName} ${doc._id} -> ${field}=${publicId}`);
  }

  await Counter.findOneAndUpdate(
    { name: counterName },
    { $max: { seq: nextSeq } },
    { new: true, upsert: true }
  );

  console.log(`[public-ids] ${Model.modelName}: ${changed} updated, ${counterName}=${nextSeq}`);
}

async function main() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  await backfillModel({ Model: Product, field: "productId", counterName: "productId", prefix: "PR" });
  await backfillModel({ Model: Article, field: "magazineId", counterName: "magazineId", prefix: "MG" });

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("[public-ids] failed", error);
  await mongoose.disconnect();
  process.exit(1);
});
