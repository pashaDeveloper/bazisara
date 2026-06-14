const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Category = require("../models/category.model");
const Game = require("../models/game.model");
const Article = require("../models/article.model");
const Slider = require("../models/slider.model");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const sampleBase = "/uploads/samples";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sampleMedia(fileName) {
  return {
    url: `${sampleBase}/${fileName}`,
    public_id: `samples/${fileName}`,
    storage: "local",
  };
}

async function categoryByName(name) {
  return Category.findOne({ name, isDeleted: false }).select("_id name").lean();
}

async function upsertGame(item, categoryId) {
  if (!categoryId) {
    console.log(`skip game ${item.title}: category not found`);
    return null;
  }

  return Game.findOneAndUpdate(
    { slug: item.slug },
    {
      $set: {
        ...item,
        category: categoryId,
        isDeleted: false,
        status: "active",
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function upsertArticle(item, categoryId) {
  if (!categoryId) {
    console.log(`skip article ${item.title}: category not found`);
    return null;
  }

  return Article.findOneAndUpdate(
    { slug: item.slug },
    {
      $set: {
        ...item,
        category: categoryId,
        isDeleted: false,
        status: "active",
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function upsertSlider(item, categoryId) {
  if (!categoryId) {
    console.log(`skip slider ${item.title}: category not found`);
    return null;
  }

  return Slider.findOneAndUpdate(
    { title: item.title },
    {
      $set: {
        ...item,
        category: categoryId,
        isDeleted: false,
        status: item.status || "active",
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const playstation = await categoryByName("بازی‌های PlayStation");
  const xbox = await categoryByName("بازی‌های Xbox");
  const switchCategory = await categoryByName("بازی‌های Nintendo");
  const pc = await categoryByName("بازی‌های کامپیوتر");
  const trailers = await categoryByName("تریلرها");
  const gameNews = await categoryByName("بازی‌های جدید");
  const featured = await categoryByName("بازی‌های برتر");
  const gameContent = await categoryByName("محتوای بازی");

  const games = [
    {
      title: "Alan Wake 2",
      slug: slugify("Alan Wake 2"),
      shortDescription: "سورئال، تاریک و پر از تعلیق در یکی از بهترین داستان‌های نسل جدید.",
      description: "نسخه نمونه برای نمایش فیلترهای دسته‌بندی و کارت‌های ویژه در صفحه بازی‌ها.",
      category: playstation?._id || pc?._id,
      cover: sampleMedia("alan-wake-2.jpg"),
      cardDesktopCover: sampleMedia("alan-wake-2.jpg"),
      isFeatured: true,
    },
    {
      title: "Dead Space",
      slug: slugify("Dead Space"),
      shortDescription: "بازسازی یکی از ترسناک‌ترین بازی‌های علمی‌تخیلی.",
      description: "نمونه‌ای برای دسته‌بندی ترسناک و نمایش کارت در فیلترهای شبیه products2.",
      category: xbox?._id || playstation?._id,
      cover: sampleMedia("dead-space.jpg"),
      cardDesktopCover: sampleMedia("dead-space.jpg"),
      isFeatured: true,
    },
    {
      title: "Prince of Persia: The Lost Crown",
      slug: slugify("Prince of Persia The Lost Crown"),
      shortDescription: "اکشن پلتفرمر سریع با ریتم تند و طراحی مرحله‌ای.",
      description: "یک بازی نمونه برای فیلترهای ماجراجویی و پلتفرمر.",
      category: switchCategory?._id || playstation?._id,
      cover: sampleMedia("prince-of-persia-the-lost-crown.jpg"),
      cardDesktopCover: sampleMedia("prince-of-persia-the-lost-crown.jpg"),
      isFeatured: false,
    },
    {
      title: "The Quarry",
      slug: slugify("The Quarry"),
      shortDescription: "تجربه داستانی سینمایی با فضای ترسناک و انتخاب‌محور.",
      description: "نمونه‌ای خوب برای نشان دادن دسته‌بندی و کارت‌های بازی.",
      category: pc?._id || playstation?._id,
      cover: sampleMedia("the-quarry.png"),
      cardDesktopCover: sampleMedia("the-quarry.png"),
      isFeatured: false,
    },
  ];

  const articleFallbackCategory = gameContent?._id || trailers?._id || gameNews?._id || featured?._id;
  const articles = [
    {
      title: "بهترین بازی‌های ترسناک برای شروع پاییز",
      slug: slugify("بهترین بازی‌های ترسناک برای شروع پاییز"),
      excerpt: "چند بازی ترسناک که با حال‌وهوای پاییز خیلی خوب می‌چسبند.",
      content: "<p>این یک مجله نمونه است تا فیلتر دسته‌بندی و کارت‌ها در مجله واقعی دیده شوند.</p>",
      author: "تحریریه بازی سرا",
      readingTime: "۶ دقیقه",
      category: trailers?._id || articleFallbackCategory,
      cover: sampleMedia("dead-space.jpg"),
      isFeatured: true,
    },
    {
      title: "امسال کدام کنسول ارزش خرید بیشتری دارد؟",
      slug: slugify("امسال کدام کنسول ارزش خرید بیشتری دارد"),
      excerpt: "مقایسه خلاصه‌ای از سه مسیر رایج برای خرید.",
      content: "<p>این مجله برای نمایش فیلتر دسته‌بندی و کارت مجله اضافه شده است.</p>",
      author: "تحریریه بازی سرا",
      readingTime: "۵ دقیقه",
      category: gameNews?._id || articleFallbackCategory,
      cover: sampleMedia("alan-wake-2.jpg"),
      isFeatured: true,
    },
    {
      title: "چطور بین اکشن و ماجراجویی انتخاب کنیم؟",
      slug: slugify("چطور بین اکشن و ماجراجویی انتخاب کنیم"),
      excerpt: "برای کسی که دنبال خرید اول است، این دو دسته خیلی مهم‌اند.",
      content: "<p>نمونه مجله‌ای برای تست فیلتر و دسته‌بندی در صفحه مجله.</p>",
      author: "تحریریه بازی سرا",
      readingTime: "۴ دقیقه",
      category: featured?._id || articleFallbackCategory,
      cover: sampleMedia("prince-of-persia-the-lost-crown.jpg"),
      isFeatured: false,
    },
    {
      title: "راهنمای کوتاه برای انتخاب یک بازی مناسب خانواده",
      slug: slugify("راهنمای کوتاه برای انتخاب یک بازی مناسب خانواده"),
      excerpt: "بازی‌های سبک‌تر و خوش‌ساخت‌تر برای دورهمی‌ها.",
      content: "<p>این هم یک نمونه دیگر برای پر کردن صفحه مجله است.</p>",
      author: "تحریریه بازی سرا",
      readingTime: "۳ دقیقه",
      category: gameContent?._id || articleFallbackCategory,
      cover: sampleMedia("the-quarry.png"),
      isFeatured: false,
    },
  ];

  const sliders = [
    {
      title: "فروش ویژه بازی‌های ترسناک",
      subtitle: "چند انتخاب داغ برای شروع فصل جدید",
      link: "/games",
      category: featured?._id || articleFallbackCategory,
      image: sampleMedia("dead-space.jpg"),
      order: 1,
      status: "active",
    },
    {
      title: "مجموعه بازی‌های ماجراجویی",
      subtitle: "برای کسانی که داستان را جدی می‌گیرند",
      link: "/games",
      category: playstation?._id || articleFallbackCategory,
      image: sampleMedia("prince-of-persia-the-lost-crown.jpg"),
      order: 2,
      status: "active",
    },
    {
      title: "جدیدترین مجله‌ها",
      subtitle: "چند نوشته تازه برای شروع مرور مجله",
      link: "/articles",
      category: gameNews?._id || articleFallbackCategory,
      image: sampleMedia("alan-wake-2.jpg"),
      order: 3,
      status: "active",
    },
  ];

  const createdGames = [];
  for (const item of games) {
    createdGames.push(await upsertGame(item, item.category));
  }

  const createdArticles = [];
  for (const item of articles) {
    createdArticles.push(await upsertArticle(item, item.category));
  }

  for (const item of sliders) {
    await upsertSlider(item, item.category);
  }

  console.log(
    `Seeded samples: games=${createdGames.filter(Boolean).length}, articles=${createdArticles.filter(Boolean).length}, sliders=${sliders.length}`
  );

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
