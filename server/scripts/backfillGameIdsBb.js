const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Counter = require("../models/counter");
const Game = require("../models/game.model");

const START_AT = 1026;
const COUNTER_NAME = "gameIdBb";
const mongoUri =
  process.env.MONGODB_URI ||
  process.env.DB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

function parseBbGameId(value) {
  const match = String(value || "").trim().match(/^bb-(\d+)$/i);
  return match ? Number(match[1]) : 0;
}

async function run() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const games = await Game.find({})
    .sort({ createdAt: 1, _id: 1 })
    .select("_id gameId")
    .lean();

  const used = new Set();
  let nextNumber = START_AT;
  let updated = 0;

  for (const game of games) {
    const currentNumber = parseBbGameId(game.gameId);
    if (currentNumber) {
      used.add(currentNumber);
      if (currentNumber >= nextNumber) nextNumber = currentNumber + 1;
    }
  }

  for (const game of games) {
    if (parseBbGameId(game.gameId)) continue;

    while (used.has(nextNumber)) nextNumber += 1;
    const gameId = `bb-${nextNumber}`;
    used.add(nextNumber);
    nextNumber += 1;

    await Game.updateOne({ _id: game._id }, { $set: { gameId } });
    updated += 1;
    console.log(`[game-id] ${game._id} -> ${gameId}`);
  }

  await Counter.findOneAndUpdate(
    { name: COUNTER_NAME },
    { $max: { seq: Math.max(0, nextNumber - START_AT) } },
    { new: true, upsert: true }
  );

  await mongoose.disconnect();
  console.log(`Game IDs backfilled to bb format: ${updated}`);
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
