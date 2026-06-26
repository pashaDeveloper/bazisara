const mongoose = require("mongoose");
require("dotenv").config();
const GameKeyword = require("../models/gameKeyword.model");

const keywords = [
  { name: "PS4", title_en: "PlayStation 4", slug: "ps4", description: "کلمه کلیدی برای ارتباط بازی‌های پلی‌استیشن 4." },
  { name: "PS5", title_en: "PlayStation 5", slug: "ps5", description: "کلمه کلیدی برای ارتباط بازی‌های پلی‌استیشن 5." },
  { name: "اکشن", title_en: "Action", slug: "action", description: "کلمه کلیدی برای بازی‌های اکشن." },
  { name: "ترسناک", title_en: "Horror", slug: "horror", description: "کلمه کلیدی برای بازی‌های ترسناک." },
  { name: "داستانی", title_en: "Story", slug: "story", description: "کلمه کلیدی برای بازی‌های داستان‌محور." },
];

async function seed() {
  const uri = process.env.MONGODB_URI || process.env.DB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Mongo connection string is not configured");

  await mongoose.connect(uri);

  for (const item of keywords) {
    await GameKeyword.updateOne(
      { slug: item.slug },
      { $setOnInsert: item },
      { upsert: true }
    );
  }

  await mongoose.disconnect();
  console.log("Game keywords seeded");
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
