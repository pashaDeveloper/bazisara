const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const Genre = require("../models/genre.model");
const { makeGenreSlug } = require("../utils/genreSlug.util");

async function run() {
  const uri = process.env.MONGODB_URI || process.env.DB_URI || process.env.DATABASE_URL || process.env.MONGO_URI || process.env.ATLAS_URI || "mongodb://127.0.0.1:27017/bazisara";
  await mongoose.connect(uri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});
  const genres = await Genre.find({ isDeleted: false }).sort({ _id: 1 }).select("name slug").lean();
  const used = new Set(genres.map((genre) => genre.slug).filter(Boolean));
  let updated = 0;
  for (const genre of genres) {
    if (genre.slug) continue;
    const base = makeGenreSlug(genre.name).slice(0, 110).replace(/-$/, "") || "genre";
    let slug = base;
    let suffix = 2;
    while (used.has(slug)) slug = `${base}-${suffix++}`;
    await Genre.updateOne({ _id: genre._id, $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] }, { $set: { slug } });
    used.add(slug);
    updated += 1;
  }
  console.log(`Genre slugs backfilled: ${updated}`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
