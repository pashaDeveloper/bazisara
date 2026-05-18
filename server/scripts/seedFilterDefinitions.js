const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const FilterDefinition = require("../models/filterDefinition.model");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const filters = [
  {
    key: "brand",
    label: "برند",
    type: "multi_select",
    options: [
      { label: "Sony", value: "sony" },
      { label: "Microsoft", value: "microsoft" },
      { label: "Nintendo", value: "nintendo" },
      { label: "Asus", value: "asus" },
      { label: "Lenovo", value: "lenovo" },
      { label: "Samsung", value: "samsung" },
    ],
  },
  {
    key: "storage",
    label: "ظرفیت حافظه",
    type: "multi_select",
    options: [
      { label: "256GB", value: "256gb" },
      { label: "512GB", value: "512gb" },
      { label: "1TB", value: "1tb" },
      { label: "2TB", value: "2tb" },
      { label: "4TB", value: "4tb" },
    ],
  },
  {
    key: "ram",
    label: "حافظه رم",
    type: "multi_select",
    options: [
      { label: "8GB", value: "8gb" },
      { label: "16GB", value: "16gb" },
      { label: "32GB", value: "32gb" },
      { label: "64GB", value: "64gb" },
    ],
  },
  {
    key: "price",
    label: "بازه قیمت",
    type: "range",
    min: 0,
    max: 300000000,
    unit: "تومان",
  },
  {
    key: "color",
    label: "رنگ",
    type: "color",
  },
  {
    key: "warranty",
    label: "گارانتی",
    type: "select",
    options: [
      { label: "بدون گارانتی", value: "no_warranty" },
      { label: "۶ ماه", value: "6_months" },
      { label: "۱۲ ماه", value: "12_months" },
      { label: "۱۸ ماه", value: "18_months" },
      { label: "۲۴ ماه", value: "24_months" },
    ],
  },
  {
    key: "connection_type",
    label: "نوع اتصال",
    type: "multi_select",
    options: [
      { label: "باسیم", value: "wired" },
      { label: "بی‌سیم", value: "wireless" },
      { label: "Bluetooth", value: "bluetooth" },
      { label: "USB-C", value: "usb_c" },
      { label: "HDMI", value: "hdmi" },
    ],
  },
  {
    key: "platform",
    label: "پلتفرم",
    type: "multi_select",
    options: [
      { label: "PlayStation 5", value: "ps5" },
      { label: "PlayStation 4", value: "ps4" },
      { label: "Xbox Series X/S", value: "xbox_series" },
      { label: "Nintendo Switch", value: "switch" },
      { label: "PC", value: "pc" },
    ],
  },
  {
    key: "genre",
    label: "ژانر",
    type: "multi_select",
    options: [
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
  },
  {
    key: "game_mode",
    label: "حالت بازی",
    type: "multi_select",
    options: [
      { label: "تک‌نفره", value: "single_player" },
      { label: "چندنفره", value: "multiplayer" },
      { label: "آنلاین", value: "online" },
      { label: "همکاری", value: "co_op" },
      { label: "رقابتی", value: "competitive" },
      { label: "لوکال", value: "local" },
    ],
  },
  {
    key: "language",
    label: "زبان",
    type: "multi_select",
    options: [
      { label: "انگلیسی", value: "english" },
      { label: "فارسی", value: "persian" },
      { label: "عربی", value: "arabic" },
      { label: "فرانسوی", value: "french" },
      { label: "آلمانی", value: "german" },
      { label: "ژاپنی", value: "japanese" },
    ],
  },
  {
    key: "age_rating",
    label: "رده سنی",
    type: "multi_select",
    options: [
      { label: "همه سنین", value: "everyone" },
      { label: "+7", value: "7_plus" },
      { label: "+12", value: "12_plus" },
      { label: "+16", value: "16_plus" },
      { label: "+18", value: "18_plus" },
    ],
  },
  {
    key: "launcher",
    label: "لانچر",
    type: "multi_select",
    options: [
      { label: "Steam", value: "steam" },
      { label: "Epic Games", value: "epic_games" },
      { label: "Battle.net", value: "battle_net" },
      { label: "EA App", value: "ea_app" },
      { label: "Ubisoft Connect", value: "ubisoft_connect" },
      { label: "GOG", value: "gog" },
    ],
  },
  {
    key: "release_year",
    label: "سال انتشار",
    type: "range",
    min: 2000,
    max: 2026,
    unit: "سال",
  },
  {
    key: "metacritic_score",
    label: "امتیاز متاکریتیک",
    type: "range",
    min: 0,
    max: 100,
    unit: "امتیاز",
  },
  {
    key: "screen_size",
    label: "اندازه صفحه نمایش",
    type: "range",
    min: 10,
    max: 65,
    unit: "اینچ",
  },
  {
    key: "refresh_rate",
    label: "نرخ تازه‌سازی تصویر",
    type: "multi_select",
    options: [
      { label: "60Hz", value: "60hz" },
      { label: "90Hz", value: "90hz" },
      { label: "120Hz", value: "120hz" },
      { label: "144Hz", value: "144hz" },
      { label: "240Hz", value: "240hz" },
    ],
  },
  {
    key: "region",
    label: "ریجن",
    type: "select",
    options: [
      { label: "اروپا", value: "eu" },
      { label: "آمریکا", value: "us" },
      { label: "ژاپن", value: "jp" },
      { label: "جهانی", value: "global" },
    ],
  },
  {
    key: "has_discount",
    label: "دارای تخفیف",
    type: "boolean",
  },
];

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const result = await FilterDefinition.bulkWrite(
    filters.map((filter) => ({
      updateOne: {
        filter: { key: filter.key },
        update: {
          $set: {
            ...filter,
            status: "active",
            isDeleted: false,
            deletedAt: null,
          },
        },
        upsert: true,
      },
    }))
  );

  console.log(
    `Filter definitions seeded. inserted=${result.upsertedCount}, modified=${result.modifiedCount}`
  );

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
