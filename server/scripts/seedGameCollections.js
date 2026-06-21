const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Game = require("../models/game.model");
const GameCollection = require("../models/gameCollection.model");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const collections = [
  {
    title_fa: "پیشنهادهای ویژه بازی‌سرا",
    title_en: "Bazisara Picks",
    slug: "bazisara-picks",
    placement: "home_featured",
    order: 1,
    description: "انتخاب‌های اصلی برای نمایش در بخش ویژه صفحه اول.",
    games: ["alan-wake-2", "dead-space", "prince-of-persia-the-lost-crown"],
  },
  {
    title_fa: "تازه‌های داغ",
    title_en: "Hot Releases",
    slug: "hot-releases",
    placement: "home_new",
    order: 2,
    description: "بازی‌هایی که برای نمایش جدیدترین‌ها در صفحه اول مناسب هستند.",
    games: ["alan-wake-2", "prince-of-persia-the-lost-crown", "the-quarry"],
  },
  {
    title_fa: "ترسناک و داستانی",
    title_en: "Horror and Story",
    slug: "horror-story",
    placement: "home_horror",
    order: 3,
    description: "بازی‌های تاریک، داستانی و مناسب حال‌وهوای ترسناک.",
    games: ["alan-wake-2", "dead-space", "the-quarry"],
  },
  {
    title_fa: "ماجراجویی منتخب",
    title_en: "Adventure Picks",
    slug: "adventure-picks",
    placement: "home_adventure",
    order: 4,
    description: "کالکشن دستی برای بازی‌های اکشن و ماجراجویی.",
    games: ["prince-of-persia-the-lost-crown", "alan-wake-2"],
  },
  {
    title_fa: "آفلاین دو نفره",
    title_en: "Offline Two Players",
    slug: "offline-two-players",
    placement: "game_players_offline",
    order: 5,
    description: "بازی‌های مناسب تجربه آفلاین دو نفره کنار هم.",
    games: [],
  },
  {
    title_fa: "کوآپ آنلاین",
    title_en: "Online Co-op",
    slug: "online-coop",
    placement: "game_players_online",
    order: 6,
    description: "کالکشن بازی‌هایی که برای همکاری آنلاین و تجربه گروهی مناسب هستند.",
    games: [],
  },
  {
    title_fa: "مولتی‌پلیر آنلاین",
    title_en: "Online Multiplayer",
    slug: "online-multiplayer",
    placement: "game_players_online",
    order: 7,
    description: "بازی‌های رقابتی یا چندنفره آنلاین برای نمایش در بخش مولتی‌پلیر.",
    games: [],
  },
  {
    title_fa: "خانوادگی و چند نفره",
    title_en: "Family Multiplayer",
    slug: "family-multiplayer",
    placement: "game_players_offline",
    order: 8,
    description: "بازی‌های 1 تا 4 نفره و مناسب دورهمی.",
    games: [],
  },
  {
    title_fa: "مرحله و بسته‌های اضافه",
    title_en: "Stages and Expansions",
    slug: "stages-expansions",
    placement: "game_content",
    order: 9,
    description: "کالکشن بازی‌هایی که مرحله، DLC یا بسته محتوایی مهم دارند.",
    games: [],
  },
];

async function getGamesBySlug(slugs) {
  const games = await Game.find({ slug: { $in: slugs }, isDeleted: false }).select("_id slug").lean();
  return games.reduce((map, item) => {
    map[item.slug] = item._id;
    return map;
  }, {});
}

async function syncGameMembership(collectionId, previousGameIds = [], nextItems = []) {
  const nextGameIds = nextItems.filter((item) => item.visible).map((item) => item.game);
  if (previousGameIds.length) {
    await Game.updateMany({ _id: { $in: previousGameIds } }, { $pull: { collections: collectionId } });
  }
  if (nextGameIds.length) {
    await Game.updateMany({ _id: { $in: nextGameIds } }, { $addToSet: { collections: collectionId } });
  }
}

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const allSlugs = [...new Set(collections.flatMap((item) => item.games))];
  const gamesBySlug = await getGamesBySlug(allSlugs);
  let inserted = 0;
  let modified = 0;

  for (const item of collections) {
    const games = item.games
      .map((slug, index) => gamesBySlug[slug] ? { game: gamesBySlug[slug], sortOrder: index, visible: true } : null)
      .filter(Boolean);

    const existing = await GameCollection.findOne({ slug: item.slug });
    const collection = existing || new GameCollection();
    const previousGameIds = existing ? existing.games.map((entry) => entry.game).filter(Boolean) : [];

    collection.title_fa = item.title_fa;
    collection.title_en = item.title_en;
    collection.slug = item.slug;
    collection.placement = item.placement;
    collection.order = item.order;
    collection.description = item.description;
    collection.games = games;
    collection.visibility = true;
    collection.status = "active";
    collection.isDeleted = false;
    collection.deletedAt = null;

    await collection.save();
    await syncGameMembership(collection._id, previousGameIds, games);
    if (existing) modified += 1;
    else inserted += 1;
  }

  const total = await GameCollection.countDocuments({ isDeleted: false });
  console.log(`Game collections seeded. inserted=${inserted}, modified=${modified}, active=${total}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
