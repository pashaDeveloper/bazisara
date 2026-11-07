const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const Game = require("../models/game.model");
const Article = require("../models/article.model");
const { isRandomPublicId, nextRandomPublicId } = require("../utils/publicId.util");

async function migrateModel({ Model, field, prefix, apply = false }) {
  let candidates = 0;
  let updated = 0;
  for await (const doc of Model.find({}).select(`_id ${field}`).lean().cursor()) {
    const oldId = String(doc[field] || "").trim();
    if (isRandomPublicId(oldId, prefix)) continue;
    candidates += 1;
    if (!apply) continue;
    const id = await nextRandomPublicId(prefix, Model, field);
    const result = await Model.updateOne(
      { _id: doc._id, [field]: doc[field] ?? null },
      { $set: { [field]: id }, ...(oldId ? { $addToSet: { legacyPublicIds: oldId } } : {}) }
    );
    updated += result.modifiedCount;
  }
  console.log(`[random-ids] ${Model.modelName}: candidates=${candidates}, updated=${updated}, mode=${apply ? "apply" : "dry-run"}`);
  return { candidates, updated };
}

async function run({ apply = process.argv.includes("--apply"), gamesOnly = process.argv.includes("--games-only") } = {}) {
  const uri = process.env.MONGODB_URI || process.env.DB_URI || process.env.DATABASE_URL || process.env.MONGO_URI || process.env.ATLAS_URI || "mongodb://127.0.0.1:27017/bazisara";
  try {
    await mongoose.connect(uri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});
    await migrateModel({ Model: Game, field: "gameId", prefix: "bazi", apply });
    if (!gamesOnly) await migrateModel({ Model: Article, field: "magazineId", prefix: "mag", apply });
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) run().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { migrateModel, run };
