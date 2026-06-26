const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Category = require("../models/category.model");
const CategoryFilter = require("../models/categoryFilter.model");
const FilterDefinition = require("../models/filterDefinition.model");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const options = {
  platforms: {
    all: [
      { label: "PlayStation 5", value: "ps5" },
      { label: "PlayStation 4", value: "ps4" },
      { label: "Xbox Series X/S", value: "xbox_series" },
      { label: "Nintendo Switch", value: "switch" },
      { label: "PC", value: "pc" },
    ],
    console: [
      { label: "PlayStation 5", value: "ps5" },
      { label: "PlayStation 4", value: "ps4" },
      { label: "Xbox Series X/S", value: "xbox_series" },
      { label: "Nintendo Switch", value: "switch" },
    ],
    playstation: [
      { label: "PlayStation 5", value: "ps5" },
      { label: "PlayStation 4", value: "ps4" },
    ],
    xbox: [{ label: "Xbox Series X/S", value: "xbox_series" }],
    nintendo: [{ label: "Nintendo Switch", value: "switch" }],
    pc: [{ label: "PC", value: "pc" }],
  },
  genres: [
    { label: "اکشن", value: "action" },
    { label: "ماجراجویی", value: "adventure" },
    { label: "نقش‌آفرینی", value: "rpg" },
    { label: "شوتر", value: "shooter" },
    { label: "ترسناک", value: "horror" },
    { label: "مسابقه‌ای", value: "racing" },
    { label: "ورزشی", value: "sports" },
    { label: "استراتژی", value: "strategy" },
    { label: "پازل", value: "puzzle" },
    { label: "جهان‌باز", value: "open_world" },
    { label: "شبیه‌ساز", value: "simulation" },
    { label: "مبارزه‌ای", value: "fighting" },
    { label: "بقا", value: "survival" },
    { label: "فانتزی", value: "fantasy" },
    { label: "علمی‌تخیلی", value: "sci_fi" },
    { label: "پلتفرمر", value: "platformer" },
  ],
};

const commonGameFilters = [
  { key: "price", sortOrder: 10, min: 0, max: 300000000, unit: "تومان" },
  { key: "platform", sortOrder: 20, options: options.platforms.all },
  { key: "genre", sortOrder: 30, options: options.genres },
  { key: "game_mode", sortOrder: 40 },
  { key: "age_rating", sortOrder: 50 },
  { key: "language", sortOrder: 60 },
  { key: "region", sortOrder: 70 },
  { key: "release_year", sortOrder: 80, min: 2000, max: 2026, unit: "سال" },
  { key: "metacritic_score", sortOrder: 90, min: 0, max: 100, unit: "امتیاز" },
  { key: "has_discount", sortOrder: 100 },
];

const commonFoodFilters = [
  { key: "price", sortOrder: 10, min: 0, max: 20000000, unit: "تومان" },
  { key: "food_brand", sortOrder: 20 },
  { key: "origin_city", sortOrder: 30 },
  { key: "package_weight", sortOrder: 40, min: 50, max: 5000, unit: "گرم" },
  { key: "package_type", sortOrder: 50 },
  { key: "usage", sortOrder: 60 },
  { key: "is_organic", sortOrder: 70 },
  { key: "has_discount", sortOrder: 80 },
];

const noghlFilters = [
  { key: "price", sortOrder: 10, min: 0, max: 10000000, unit: "تومان" },
  { key: "flavor", sortOrder: 20 },
  { key: "nut_type", sortOrder: 30 },
  { key: "sweetness_level", sortOrder: 40 },
  { key: "package_weight", sortOrder: 50, min: 50, max: 5000, unit: "گرم" },
  { key: "package_type", sortOrder: 60 },
  { key: "origin_city", sortOrder: 70 },
  { key: "usage", sortOrder: 80 },
  { key: "has_discount", sortOrder: 90 },
];

const halvaFilters = [
  { key: "price", sortOrder: 10, min: 0, max: 15000000, unit: "تومان" },
  { key: "halva_type", sortOrder: 20 },
  { key: "flavor", sortOrder: 30 },
  { key: "nut_type", sortOrder: 40 },
  { key: "texture", sortOrder: 50 },
  { key: "sugar_type", sortOrder: 60 },
  { key: "package_weight", sortOrder: 70, min: 100, max: 5000, unit: "گرم" },
  { key: "package_type", sortOrder: 80 },
  { key: "origin_city", sortOrder: 90 },
  { key: "usage", sortOrder: 100 },
  { key: "has_discount", sortOrder: 110 },
];

const distillateFilters = [
  { key: "price", sortOrder: 10, min: 0, max: 10000000, unit: "تومان" },
  { key: "distillate_type", sortOrder: 20 },
  { key: "volume", sortOrder: 30, min: 100, max: 5000, unit: "میلی‌لیتر" },
  { key: "concentration", sortOrder: 40 },
  { key: "package_type", sortOrder: 50 },
  { key: "origin_city", sortOrder: 60 },
  { key: "usage", sortOrder: 70 },
  { key: "is_organic", sortOrder: 80 },
  { key: "has_discount", sortOrder: 90 },
];

const categoryFilters = [
  { category: "بازی‌ها", filters: commonGameFilters },
  {
    category: "بازی‌های کنسولی",
    filters: [
      { key: "price", sortOrder: 10, min: 0, max: 300000000, unit: "تومان" },
      { key: "platform", sortOrder: 20, options: options.platforms.console },
      { key: "genre", sortOrder: 30, options: options.genres },
      { key: "region", sortOrder: 40 },
      { key: "age_rating", sortOrder: 50 },
      { key: "has_discount", sortOrder: 60 },
    ],
  },
  {
    category: "بازی‌های کامپیوتر",
    filters: [
      { key: "price", sortOrder: 10, min: 0, max: 300000000, unit: "تومان" },
      { key: "platform", sortOrder: 20, options: options.platforms.pc },
      { key: "launcher", sortOrder: 30 },
      { key: "genre", sortOrder: 40, options: options.genres },
      { key: "game_mode", sortOrder: 50 },
      { key: "language", sortOrder: 60 },
      { key: "has_discount", sortOrder: 70 },
    ],
  },
  {
    category: "بازی‌های PlayStation",
    filters: [
      { key: "price", sortOrder: 10, min: 0, max: 300000000, unit: "تومان" },
      { key: "platform", sortOrder: 20, options: options.platforms.playstation },
      { key: "genre", sortOrder: 30, options: options.genres },
      { key: "region", sortOrder: 40 },
      { key: "age_rating", sortOrder: 50 },
    ],
  },
  {
    category: "بازی‌های Xbox",
    filters: [
      { key: "price", sortOrder: 10, min: 0, max: 300000000, unit: "تومان" },
      { key: "platform", sortOrder: 20, options: options.platforms.xbox },
      { key: "genre", sortOrder: 30, options: options.genres },
      { key: "region", sortOrder: 40 },
      { key: "age_rating", sortOrder: 50 },
    ],
  },
  {
    category: "بازی‌های Nintendo",
    filters: [
      { key: "price", sortOrder: 10, min: 0, max: 300000000, unit: "تومان" },
      { key: "platform", sortOrder: 20, options: options.platforms.nintendo },
      { key: "genre", sortOrder: 30, options: options.genres },
      { key: "age_rating", sortOrder: 40 },
    ],
  },
  {
    category: "ژانرهای بازی",
    filters: [
      { key: "platform", sortOrder: 10, options: options.platforms.all },
      { key: "game_mode", sortOrder: 20 },
      { key: "age_rating", sortOrder: 30 },
      { key: "price", sortOrder: 40, min: 0, max: 300000000, unit: "تومان" },
    ],
  },
  {
    category: "محتوای بازی",
    filters: [
      { key: "platform", sortOrder: 10, options: options.platforms.all },
      { key: "genre", sortOrder: 20, options: options.genres },
      { key: "release_year", sortOrder: 30, min: 2000, max: 2026, unit: "سال" },
    ],
  },
  { category: "خوراکی و سوغات", filters: commonFoodFilters },
  { category: "نقل", filters: noghlFilters },
  { category: "نقل ساده", filters: noghlFilters },
  { category: "نقل مغزدار", filters: noghlFilters },
  { category: "نقل طعم‌دار", filters: noghlFilters },
  { category: "حلوا", filters: halvaFilters },
  { category: "حلوا سنتی", filters: halvaFilters },
  { category: "حلوا ارده", filters: halvaFilters },
  { category: "حلوا مجلسی", filters: halvaFilters },
  { category: "عرقیات گیاهی", filters: distillateFilters },
  { category: "عرقیات آرام‌بخش", filters: distillateFilters },
  { category: "عرقیات گوارشی", filters: distillateFilters },
  { category: "گلاب و عرق گل", filters: distillateFilters },
];

const genreCategoryNames = [
  "اکشن",
  "ماجراجویی",
  "نقش‌آفرینی",
  "شوتر",
  "ترسناک",
  "مسابقه‌ای",
  "ورزشی",
  "استراتژی",
  "پازل",
  "جهان‌باز",
  "شبیه‌ساز",
  "مبارزه‌ای",
  "بقا",
  "فانتزی",
  "علمی‌تخیلی",
  "پلتفرمر",
];

function normalizeNumber(value, fallback = null) {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isNaN(number) ? fallback : number;
}

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const [categories, definitions] = await Promise.all([
    Category.find({ isDeleted: false }).select("_id name").lean(),
    FilterDefinition.find({ isDeleted: false }).lean(),
  ]);

  const categoriesByName = categories.reduce((map, item) => {
    map[item.name] = item;
    return map;
  }, {});
  const definitionsByKey = definitions.reduce((map, item) => {
    map[item.key] = item;
    return map;
  }, {});

  const entries = [...categoryFilters];
  for (const category of genreCategoryNames) {
    entries.push({
      category,
      filters: [
        { key: "platform", sortOrder: 10, options: options.platforms.all },
        { key: "game_mode", sortOrder: 20 },
        { key: "age_rating", sortOrder: 30 },
        { key: "price", sortOrder: 40, min: 0, max: 300000000, unit: "تومان" },
        { key: "has_discount", sortOrder: 50 },
      ],
    });
  }

  const operations = [];
  const skipped = [];

  for (const group of entries) {
    const category = categoriesByName[group.category];
    if (!category) {
      skipped.push(`category:${group.category}`);
      continue;
    }

    for (const item of group.filters) {
      const definition = definitionsByKey[item.key];
      if (!definition) {
        skipped.push(`filter:${item.key}`);
        continue;
      }

      const optionsValue = item.options || definition.options || [];
      const min = normalizeNumber(item.min, definition.min ?? null);
      const max = normalizeNumber(item.max, definition.max ?? null);

      operations.push({
        updateOne: {
          filter: {
            category: category._id,
            filter: definition._id,
            isDeleted: false,
          },
          update: {
            $set: {
              category: category._id,
              filter: definition._id,
              key: definition.key,
              label: definition.label,
              type: definition.type,
              options: ["select", "multi_select", "color"].includes(definition.type)
                ? optionsValue
                : [],
              min: ["number", "range"].includes(definition.type) ? min : null,
              max: ["number", "range"].includes(definition.type) ? max : null,
              unit: ["number", "range"].includes(definition.type)
                ? item.unit || definition.unit || ""
                : "",
              isRequired: Boolean(item.isRequired),
              sortOrder: normalizeNumber(item.sortOrder, 0),
              status: "active",
              isDeleted: false,
              deletedAt: null,
            },
          },
          upsert: true,
        },
      });
    }
  }

  const result = operations.length
    ? await CategoryFilter.bulkWrite(operations)
    : { upsertedCount: 0, modifiedCount: 0 };

  const total = await CategoryFilter.countDocuments({ isDeleted: false });
  console.log(
    `Category filters seeded. inserted=${result.upsertedCount}, modified=${result.modifiedCount}, active=${total}`
  );

  if (skipped.length) {
    console.warn(`Skipped missing references: ${skipped.join(", ")}`);
  }

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
