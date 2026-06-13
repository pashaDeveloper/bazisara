const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Brand = require("../models/brand.model");
const { generateSlug, normalizePersianSlug } = require("../utils/seoUtils");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const brands = [
  {
    title_fa: "سونی",
    title_en: "Sony",
    website: "https://www.sony.com",
    foundedYear: 1946,
    rate: 4.5,
    logo: "https://placehold.co/296x200.png?text=Sony",
    description: "برند ژاپنی شناخته‌شده در حوزه سرگرمی، کنسول، صوت و تصویر و تجهیزات دیجیتال.",
  },
  {
    title_fa: "پلی استیشن",
    title_en: "PlayStation",
    website: "https://www.playstation.com",
    foundedYear: 1994,
    rate: 5,
    logo: "https://placehold.co/296x200.png?text=PlayStation",
    description: "زیرمجموعه گیمینگ سونی و یکی از مهم‌ترین برندهای کنسول و سرگرمی تعاملی.",
  },
  {
    title_fa: "مایکروسافت",
    title_en: "Microsoft",
    website: "https://www.microsoft.com",
    foundedYear: 1975,
    rate: 4.5,
    logo: "https://placehold.co/296x200.png?text=Microsoft",
    description: "شرکت فناوری آمریکایی و مالک اکوسیستم Xbox، ویندوز و سرویس‌های ابری.",
  },
  {
    title_fa: "ایکس باکس",
    title_en: "Xbox",
    website: "https://www.xbox.com",
    foundedYear: 2001,
    rate: 4,
    logo: "https://placehold.co/296x200.png?text=Xbox",
    description: "برند گیمینگ مایکروسافت برای کنسول، سرویس اشتراکی، بازی و لوازم جانبی.",
  },
  {
    title_fa: "نینتندو",
    title_en: "Nintendo",
    website: "https://www.nintendo.com",
    foundedYear: 1889,
    rate: 4.5,
    logo: "https://placehold.co/296x200.png?text=Nintendo",
    description: "برند ژاپنی خلاق در صنعت بازی با کنسول‌های Switch و فرنچایزهای محبوب خانوادگی.",
  },
  {
    title_fa: "لاجیتک",
    title_en: "Logitech",
    website: "https://www.logitech.com",
    foundedYear: 1981,
    rate: 4,
    logo: "https://placehold.co/296x200.png?text=Logitech",
    description: "برند شناخته‌شده لوازم جانبی کامپیوتر، گیمینگ، کیبورد، ماوس و تجهیزات استریم.",
  },
  {
    title_fa: "ریزر",
    title_en: "Razer",
    website: "https://www.razer.com",
    foundedYear: 2005,
    rate: 4,
    logo: "https://placehold.co/296x200.png?text=Razer",
    description: "برند تخصصی تجهیزات گیمینگ شامل هدست، کیبورد، ماوس و لوازم جانبی حرفه‌ای.",
  },
  {
    title_fa: "کورسیر",
    title_en: "Corsair",
    website: "https://www.corsair.com",
    foundedYear: 1994,
    rate: 4,
    logo: "https://placehold.co/296x200.png?text=Corsair",
    description: "تولیدکننده قطعات و تجهیزات گیمینگ، رم، کیس، منبع تغذیه و لوازم جانبی.",
  },
];

function makeBrandCode(item) {
  return generateSlug(item.title_en || item.title_fa) || normalizePersianSlug(item.title_fa) || "brand";
}

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  let inserted = 0;
  let modified = 0;

  for (const item of brands) {
    const existing = await Brand.findOne({
      $or: [{ title_fa: item.title_fa }, { title_en: item.title_en }],
    });

    const brand = existing || new Brand();
    brand.title_fa = item.title_fa;
    brand.title_en = item.title_en;
    brand.code = brand.code || makeBrandCode(item);
    brand.website = item.website;
    brand.foundedYear = item.foundedYear;
    brand.rate = item.rate;
    brand.description = item.description;
    brand.visibility = true;
    brand.status = "active";
    brand.isDeleted = false;
    brand.deletedAt = null;
    brand.logo = {
      url: item.logo,
      public_id: "seed-placeholder",
    };

    await brand.save();
    if (existing) modified += 1;
    else inserted += 1;
  }

  const total = await Brand.countDocuments({ isDeleted: false });
  console.log(`Brands seeded. inserted=${inserted}, modified=${modified}, active=${total}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
