const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Game = require("../models/game.model");
const Tag = require("../models/tag.model");
const { buildGameDynamicTagNames } = require("../utils/gameSeo.util");

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.DB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

function makeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueIds(values) {
  const seen = new Set();
  return values
    .map((value) => String(value?._id || value || "").trim())
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

async function ensureTags(title) {
  const tagIds = [];

  for (const name of buildGameDynamicTagNames(title)) {
    const slug = makeSlug(name);
    if (!slug) continue;

    const tag = await Tag.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          description: name,
          name,
          seoDescription: name,
          seoKeywords: [name],
          seoTitle: name,
          slug,
        },
      },
      { new: true, upsert: true }
    ).select("_id");

    tagIds.push(tag._id);
  }

  return tagIds;
}

async function run() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const games = await Game.find({ isDeleted: false }).select("_id title tags").lean();
  let updated = 0;

  for (const game of games) {
    const dynamicTagIds = await ensureTags(game.title);
    const tags = uniqueIds([...(game.tags || []), ...dynamicTagIds]);

    await Game.updateOne({ _id: game._id }, { $set: { tags } });
    updated += 1;
  }

  await mongoose.disconnect();
  console.log(`Game dynamic tags backfilled: ${updated}`);
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
