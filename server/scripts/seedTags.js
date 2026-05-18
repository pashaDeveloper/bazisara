const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Tag = require("../models/tag.model");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
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

const tags = [
  {
    name: "بازی اکشن",
    slug: "action-games",
    description: "تگ مخصوص بازی‌های سریع، مبارزه‌ای و پرهیجان.",
    seoTitle: "خرید و دانلود بازی اکشن",
    seoDescription: "لیست بازی‌های اکشن محبوب برای پیدا کردن سریع‌تر بازی‌های مبارزه‌ای، شوتر و هیجانی.",
    seoKeywords: ["بازی اکشن", "خرید بازی اکشن", "دانلود بازی اکشن"],
  },
  {
    name: "بازی ماجراجویی",
    slug: "adventure-games",
    description: "تگ بازی‌های داستانی، اکتشافی و ماجراجویانه.",
    seoTitle: "بهترین بازی‌های ماجراجویی",
    seoDescription: "مجموعه بازی‌های ماجراجویی با تمرکز روی داستان، کشف محیط و تجربه سینمایی.",
    seoKeywords: ["بازی ماجراجویی", "بازی داستانی", "adventure game"],
  },
  {
    name: "بازی نقش‌آفرینی",
    slug: "rpg-games",
    description: "تگ بازی‌های RPG با پیشرفت شخصیت، انتخاب و داستان عمیق.",
    seoTitle: "بازی‌های نقش‌آفرینی RPG",
    seoDescription: "فهرست بازی‌های نقش‌آفرینی برای علاقه‌مندان به RPG، جهان‌های فانتزی و انتخاب‌های داستانی.",
    seoKeywords: ["بازی RPG", "بازی نقش‌آفرینی", "خرید بازی RPG"],
  },
  {
    name: "بازی شوتر",
    slug: "shooter-games",
    description: "تگ بازی‌های تیراندازی اول‌شخص و سوم‌شخص.",
    seoTitle: "خرید بازی شوتر",
    seoDescription: "بازی‌های شوتر اول‌شخص و سوم‌شخص با گیم‌پلی سریع و رقابتی.",
    seoKeywords: ["بازی شوتر", "بازی تیراندازی", "FPS"],
  },
  {
    name: "بازی ترسناک",
    slug: "horror-games",
    description: "تگ بازی‌های وحشت، بقا و فضای دلهره‌آور.",
    seoTitle: "بهترین بازی‌های ترسناک",
    seoDescription: "بازی‌های ترسناک و بقا برای تجربه فضاهای دلهره‌آور و داستان‌های پرتنش.",
    seoKeywords: ["بازی ترسناک", "بازی وحشت", "survival horror"],
  },
  {
    name: "بازی جهان‌باز",
    slug: "open-world-games",
    description: "تگ بازی‌هایی با نقشه بزرگ، آزادی عمل و محتوای گسترده.",
    seoTitle: "بازی‌های جهان‌باز",
    seoDescription: "لیست بازی‌های Open World با دنیای بزرگ، ماموریت‌های متنوع و آزادی در گیم‌پلی.",
    seoKeywords: ["بازی جهان‌باز", "open world", "بازی اوپن ورلد"],
  },
  {
    name: "بازی مسابقه‌ای",
    slug: "racing-games",
    description: "تگ بازی‌های رانندگی، موتورسواری و رقابت سرعتی.",
    seoTitle: "خرید بازی مسابقه‌ای",
    seoDescription: "بازی‌های مسابقه‌ای و رانندگی برای علاقه‌مندان به سرعت، ماشین و رقابت.",
    seoKeywords: ["بازی مسابقه‌ای", "بازی رانندگی", "racing game"],
  },
  {
    name: "بازی ورزشی",
    slug: "sports-games",
    description: "تگ بازی‌های فوتبال، بسکتبال، مبارزات ورزشی و رقابت‌های رسمی.",
    seoTitle: "بازی‌های ورزشی",
    seoDescription: "فهرست بازی‌های ورزشی شامل فوتبال، بسکتبال، مبارزه و رقابت‌های تیمی.",
    seoKeywords: ["بازی ورزشی", "بازی فوتبال", "sports game"],
  },
  {
    name: "بازی استراتژی",
    slug: "strategy-games",
    description: "تگ بازی‌های تاکتیکی، مدیریتی و برنامه‌ریزی‌محور.",
    seoTitle: "بهترین بازی‌های استراتژی",
    seoDescription: "بازی‌های استراتژی و تاکتیکی برای مدیریت منابع، تصمیم‌گیری و برنامه‌ریزی.",
    seoKeywords: ["بازی استراتژی", "بازی تاکتیکی", "strategy game"],
  },
  {
    name: "بازی پازل",
    slug: "puzzle-games",
    description: "تگ بازی‌های معمایی، فکری و حل مسئله.",
    seoTitle: "بازی‌های پازل و فکری",
    seoDescription: "بازی‌های پازل و فکری برای حل معما، چالش ذهنی و تجربه آرام‌تر.",
    seoKeywords: ["بازی پازل", "بازی فکری", "puzzle game"],
  },
  {
    name: "بازی شبیه‌ساز",
    slug: "simulation-games",
    description: "تگ بازی‌های شبیه‌سازی رانندگی، پرواز، مدیریت و زندگی.",
    seoTitle: "بازی‌های شبیه‌ساز",
    seoDescription: "بازی‌های Simulation برای تجربه رانندگی، پرواز، مدیریت و شبیه‌سازی‌های واقعی.",
    seoKeywords: ["بازی شبیه‌ساز", "simulation game", "بازی مدیریت"],
  },
  {
    name: "بازی مبارزه‌ای",
    slug: "fighting-games",
    description: "تگ بازی‌های فایتینگ و مبارزه تن‌به‌تن.",
    seoTitle: "بازی‌های مبارزه‌ای",
    seoDescription: "بازی‌های fighting و مبارزه‌ای برای رقابت تن‌به‌تن و کمبوهای هیجان‌انگیز.",
    seoKeywords: ["بازی مبارزه‌ای", "بازی فایتینگ", "fighting game"],
  },
  {
    name: "بازی بقا",
    slug: "survival-games",
    description: "تگ بازی‌های Survival با مدیریت منابع و زنده‌ماندن.",
    seoTitle: "بازی‌های بقا",
    seoDescription: "بازی‌های بقا با تمرکز روی ساخت‌وساز، مدیریت منابع و زنده‌ماندن در محیط‌های سخت.",
    seoKeywords: ["بازی بقا", "survival game", "بازی زامبی"],
  },
  {
    name: "بازی فانتزی",
    slug: "fantasy-games",
    description: "تگ بازی‌هایی با جهان جادویی، اسطوره‌ای و فانتزی.",
    seoTitle: "بازی‌های فانتزی",
    seoDescription: "فهرست بازی‌های فانتزی با جهان‌های جادویی، موجودات اسطوره‌ای و داستان‌های حماسی.",
    seoKeywords: ["بازی فانتزی", "fantasy game", "بازی جادویی"],
  },
  {
    name: "بازی علمی‌تخیلی",
    slug: "sci-fi-games",
    description: "تگ بازی‌هایی با فضای آینده‌نگر، فضایی و تکنولوژیک.",
    seoTitle: "بازی‌های علمی‌تخیلی",
    seoDescription: "بازی‌های Sci-Fi با فضا، فناوری آینده، ربات‌ها و جهان‌های پیشرفته.",
    seoKeywords: ["بازی علمی‌تخیلی", "sci-fi game", "بازی فضایی"],
  },
  {
    name: "بازی پلتفرمر",
    slug: "platformer-games",
    description: "تگ بازی‌های مرحله‌ای، پرشی و حرکت دقیق روی پلتفرم‌ها.",
    seoTitle: "بازی‌های پلتفرمر",
    seoDescription: "بازی‌های Platformer برای علاقه‌مندان به پرش، مراحل چالشی و کنترل دقیق.",
    seoKeywords: ["بازی پلتفرمر", "platformer game", "بازی مرحله‌ای"],
  },
  {
    name: "بازی چندنفره",
    slug: "multiplayer-games",
    description: "تگ بازی‌های آنلاین، کوآپ و رقابتی چندنفره.",
    seoTitle: "بازی‌های چندنفره و آنلاین",
    seoDescription: "بازی‌های چندنفره، آنلاین و کوآپ برای تجربه رقابت یا همکاری با دیگر بازیکنان.",
    seoKeywords: ["بازی چندنفره", "بازی آنلاین", "multiplayer game"],
  },
  {
    name: "بازی مستقل",
    slug: "indie-games",
    description: "تگ بازی‌های مستقل با ایده‌های خلاقانه و تیم‌های کوچک‌تر.",
    seoTitle: "بازی‌های مستقل Indie",
    seoDescription: "بازی‌های مستقل و خلاقانه با تجربه‌های متفاوت، هنری و داستانی.",
    seoKeywords: ["بازی مستقل", "indie game", "بازی ایندی"],
  },
  {
    name: "بازی خانوادگی",
    slug: "family-games",
    description: "تگ بازی‌های مناسب خانواده، کودکان و تجربه‌های ساده‌تر.",
    seoTitle: "بازی‌های خانوادگی",
    seoDescription: "بازی‌های مناسب خانواده و سنین مختلف برای تجربه سرگرم‌کننده و کم‌تنش.",
    seoKeywords: ["بازی خانوادگی", "بازی کودک", "family game"],
  },
  {
    name: "بازی جدید",
    slug: "new-games",
    description: "تگ بازی‌های تازه منتشرشده یا در صف انتشار.",
    seoTitle: "جدیدترین بازی‌ها",
    seoDescription: "جدیدترین بازی‌های منتشرشده و بازی‌های تازه اضافه‌شده به فروشگاه.",
    seoKeywords: ["بازی جدید", "جدیدترین بازی", "new games"],
  },
  {
    name: "بازی پیشنهادی",
    slug: "recommended-games",
    description: "تگ بازی‌های منتخب، محبوب و پیشنهادی فروشگاه.",
    seoTitle: "بازی‌های پیشنهادی",
    seoDescription: "لیست بازی‌های پیشنهادی و منتخب برای انتخاب راحت‌تر بین گزینه‌های محبوب.",
    seoKeywords: ["بازی پیشنهادی", "بهترین بازی", "بازی محبوب"],
  },
];

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const result = await Tag.bulkWrite(
    tags.map((item) => {
      const slug = makeSlug(item.slug || item.name);

      return {
        updateOne: {
          filter: { slug },
          update: {
            $set: {
              ...item,
              slug,
              status: "active",
              isDeleted: false,
              deletedAt: null,
            },
            $setOnInsert: {
              image: { url: "", public_id: "" },
            },
          },
          upsert: true,
        },
      };
    })
  );

  const total = await Tag.countDocuments({ isDeleted: false });
  console.log(`Tags seeded without images. inserted=${result.upsertedCount}, modified=${result.modifiedCount}, active=${total}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
