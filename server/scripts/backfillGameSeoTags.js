const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Game = require("../models/game.model");
const { buildGameSeoPayload } = require("../utils/gameSeo.util");

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.DB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

async function run() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const games = await Game.find({ isDeleted: false }).select("title summary description shortDescription seoKeywords");
  let updated = 0;

  for (const game of games) {
    const seoPayload = buildGameSeoPayload({
      title: game.title,
      summary: game.summary,
      description: game.description || game.shortDescription,
      seoKeywords: game.seoKeywords,
    });

    await Game.updateOne({ _id: game._id }, { $set: seoPayload });
    updated += 1;
  }

  await mongoose.disconnect();
  console.log(`Game SEO tags backfilled: ${updated}`);
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
