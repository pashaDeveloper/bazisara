const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Article = require("../models/article.model");
const Counter = require("../models/counter");
const Game = require("../models/game.model");

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.DB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

async function backfillModel({ Model, field, counterName }) {
  const [maxDoc, counter, missingDocs] = await Promise.all([
    Model.findOne({ [field]: { $type: "number" } }).sort({ [field]: -1 }).select(field).lean(),
    Counter.findOne({ name: counterName }).lean(),
    Model.find({
      $or: [{ [field]: { $exists: false } }, { [field]: null }],
    })
      .sort({ createdAt: 1, _id: 1 })
      .select("_id")
      .lean(),
  ]);

  let nextId = Math.max(Number(maxDoc?.[field] || 0), Number(counter?.seq || 0));

  for (const doc of missingDocs) {
    nextId += 1;
    await Model.updateOne({ _id: doc._id }, { $set: { [field]: nextId } });
    console.log(`[public-ids] ${Model.modelName} ${doc._id} -> ${field}=${nextId}`);
  }

  await Counter.findOneAndUpdate(
    { name: counterName },
    { $max: { seq: nextId } },
    { new: true, upsert: true }
  );

  console.log(`[public-ids] ${Model.modelName}: ${missingDocs.length} backfilled, ${counterName}=${nextId}`);
}

async function main() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  await backfillModel({ Model: Game, field: "gameId", counterName: "gameId" });
  await backfillModel({ Model: Article, field: "magazineId", counterName: "magazineId" });

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("[public-ids] failed", error);
  await mongoose.disconnect();
  process.exit(1);
});
