const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Brand = require("../models/brand.model");
const Platform = require("../models/platform.model");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const platforms = [
  {
    name_fa: "پلی استیشن",
    name_en: "PlayStation",
    slug: "playstation",
    brand: "PlayStation",
    description: "خانواده پلتفرم‌های گیمینگ پلی‌استیشن.",
  },
  {
    name_fa: "پلی استیشن ۵",
    name_en: "PlayStation 5",
    slug: "playstation-5",
    brand: "PlayStation",
    parent: "playstation",
    productionDate: "2020-11-12",
    description: "کنسول نسل نهم پلی‌استیشن با پشتیبانی از SSD پرسرعت، DualSense و بازی‌های نسل جدید.",
  },
  {
    name_fa: "پلی استیشن ۴",
    name_en: "PlayStation 4",
    slug: "playstation-4",
    brand: "PlayStation",
    parent: "playstation",
    productionDate: "2013-11-15",
    description: "کنسول نسل هشتم پلی‌استیشن و یکی از پرفروش‌ترین پلتفرم‌های بازی.",
  },
  {
    name_fa: "پلی استیشن ۳",
    name_en: "PlayStation 3",
    slug: "playstation-3",
    brand: "PlayStation",
    parent: "playstation",
    productionDate: "2006-11-11",
    description: "کنسول نسل هفتم پلی‌استیشن با دیسک Blu-ray و بازی‌های کلاسیک.",
  },
  {
    name_fa: "ایکس باکس",
    name_en: "Xbox",
    slug: "xbox",
    brand: "Xbox",
    description: "خانواده پلتفرم‌های گیمینگ ایکس‌باکس.",
  },
  {
    name_fa: "ایکس باکس سری ایکس/اس",
    name_en: "Xbox Series X|S",
    slug: "xbox-series-xs",
    brand: "Xbox",
    parent: "xbox",
    productionDate: "2020-11-10",
    description: "کنسول نسل نهم ایکس‌باکس با تمرکز روی Game Pass، سرعت و اجرای نسل جدید.",
  },
  {
    name_fa: "ایکس باکس وان",
    name_en: "Xbox One",
    slug: "xbox-one",
    brand: "Xbox",
    parent: "xbox",
    productionDate: "2013-11-22",
    description: "کنسول نسل هشتم ایکس‌باکس با پشتیبانی گسترده از بازی‌های دیجیتال و دیسکی.",
  },
  {
    name_fa: "نینتندو",
    name_en: "Nintendo",
    slug: "nintendo",
    brand: "Nintendo",
    description: "خانواده پلتفرم‌های گیمینگ نینتندو.",
  },
  {
    name_fa: "نینتندو سوییچ",
    name_en: "Nintendo Switch",
    slug: "nintendo-switch",
    brand: "Nintendo",
    parent: "nintendo",
    productionDate: "2017-03-03",
    description: "کنسول هیبریدی نینتندو برای بازی دستی و اتصال به تلویزیون.",
  },
  {
    name_fa: "کامپیوتر ویندوز",
    name_en: "Windows PC",
    slug: "windows-pc",
    brand: "Microsoft",
    productionDate: "1985-11-20",
    description: "پلتفرم کامپیوتر برای بازی‌های ویندوز، لانچرهای دیجیتال و سخت‌افزارهای متنوع.",
  },
];

async function getBrandMap() {
  const brands = await Brand.find({ isDeleted: false }).select("_id title_en title_fa").lean();
  return brands.reduce((map, item) => {
    if (item.title_en) map[item.title_en.toLowerCase()] = item._id;
    if (item.title_fa) map[item.title_fa] = item._id;
    return map;
  }, {});
}

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const brandMap = await getBrandMap();
  const platformMap = {};
  let inserted = 0;
  let modified = 0;
  let skipped = 0;

  for (const item of platforms) {
    const brandId = brandMap[String(item.brand).toLowerCase()] || brandMap[item.brand];
    if (!brandId) {
      console.log(`skip platform ${item.name_en}: brand ${item.brand} not found`);
      skipped += 1;
      continue;
    }

    const existing = await Platform.findOne({ slug: item.slug });
    const platform = existing || new Platform();

    platform.name_fa = item.name_fa;
    platform.name_en = item.name_en;
    platform.name = item.name_fa;
    platform.slug = item.slug;
    platform.brand = brandId;
    platform.parent = item.parent ? platformMap[item.parent] || null : null;
    platform.description = item.description || "";
    platform.productionDate = item.productionDate ? new Date(item.productionDate) : null;
    platform.status = "active";
    platform.isDeleted = false;
    platform.deletedAt = null;
    platform.image = platform.image?.url
      ? platform.image
      : { url: "", public_id: "", storage: "" };
    platform.set("brands", undefined, { strict: false });

    await platform.save();
    platformMap[item.slug] = platform._id;
    if (existing) modified += 1;
    else inserted += 1;
  }

  const total = await Platform.countDocuments({ isDeleted: false });
  console.log(`Platforms seeded without images. inserted=${inserted}, modified=${modified}, skipped=${skipped}, active=${total}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
