const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const Category = require("../models/category.model");
const Icon = require("../models/icon.model");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const categories = [
  {
    name: "بازی‌ها",
    description: "دسته اصلی بازی‌های ویدیویی برای همه پلتفرم‌ها و سبک‌ها.",
    icon: "بازی",
    children: [
      {
        name: "بازی‌های کنسولی",
        description: "بازی‌های مخصوص PlayStation، Xbox و Nintendo Switch.",
        icon: "پلتفرم",
      },
      {
        name: "بازی‌های کامپیوتر",
        description: "بازی‌های PC، لانچرهای دیجیتال و نسخه‌های قابل اجرا روی ویندوز.",
        icon: "PC",
      },
      {
        name: "بازی‌های PlayStation",
        description: "بازی‌ها و نسخه‌های مخصوص کنسول‌های پلی‌استیشن.",
        icon: "PlayStation",
      },
      {
        name: "بازی‌های Xbox",
        description: "بازی‌ها و نسخه‌های مخصوص کنسول‌های ایکس‌باکس.",
        icon: "Xbox",
      },
      {
        name: "بازی‌های Nintendo",
        description: "بازی‌های مخصوص Nintendo Switch و خانواده نینتندو.",
        icon: "Nintendo Switch",
      },
    ],
  },
  {
    name: "ژانرهای بازی",
    description: "دسته‌بندی بازی‌ها بر اساس سبک و تجربه گیم‌پلی.",
    icon: "ژانر",
    children: [
      {
        name: "اکشن",
        description: "بازی‌های سریع، مبارزه‌محور و هیجان‌انگیز.",
        icon: "اکشن",
      },
      {
        name: "ماجراجویی",
        description: "بازی‌های داستانی، اکتشافی و سفرمحور.",
        icon: "ماجراجویی",
      },
      {
        name: "نقش‌آفرینی",
        description: "بازی‌های RPG با پیشرفت شخصیت، انتخاب و داستان عمیق.",
        icon: "نقش‌آفرینی",
      },
      {
        name: "شوتر",
        description: "بازی‌های تیراندازی اول‌شخص و سوم‌شخص.",
        icon: "شوتر",
      },
      {
        name: "ترسناک",
        description: "بازی‌های وحشت، بقا و فضای دلهره‌آور.",
        icon: "ترسناک",
      },
      {
        name: "مسابقه‌ای",
        description: "بازی‌های رانندگی، موتورسواری و رقابت سرعتی.",
        icon: "مسابقه‌ای",
      },
      {
        name: "ورزشی",
        description: "بازی‌های فوتبال، بسکتبال، مبارزات ورزشی و رقابت‌های رسمی.",
        icon: "ورزشی",
      },
      {
        name: "استراتژی",
        description: "بازی‌های تاکتیکی، مدیریتی و برنامه‌ریزی‌محور.",
        icon: "استراتژی",
      },
      {
        name: "پازل",
        description: "بازی‌های معمایی، فکری و حل مسئله.",
        icon: "پازل",
      },
      {
        name: "جهان‌باز",
        description: "بازی‌های Open World با نقشه بزرگ و آزادی عمل بالا.",
        icon: "جهان‌باز",
      },
      {
        name: "شبیه‌ساز",
        description: "بازی‌های شبیه‌سازی رانندگی، پرواز، مدیریت و زندگی.",
        icon: "شبیه‌ساز",
      },
      {
        name: "مبارزه‌ای",
        description: "بازی‌های فایتینگ و مبارزه تن‌به‌تن.",
        icon: "مبارزه‌ای",
      },
      {
        name: "بقا",
        description: "بازی‌های Survival با مدیریت منابع و زنده‌ماندن.",
        icon: "بقا",
      },
      {
        name: "فانتزی",
        description: "بازی‌هایی با جهان جادویی، اسطوره‌ای و فانتزی.",
        icon: "فانتزی",
      },
      {
        name: "علمی‌تخیلی",
        description: "بازی‌هایی با فضای آینده‌نگر، فضایی و تکنولوژیک.",
        icon: "علمی‌تخیلی",
      },
      {
        name: "پلتفرمر",
        description: "بازی‌های پرش، مرحله‌ای و حرکت دقیق روی پلتفرم‌ها.",
        icon: "پلتفرمر",
      },
    ],
  },
  {
    name: "محتوای بازی",
    description: "محتواهای کمکی و رسانه‌ای مرتبط با معرفی بازی‌ها.",
    icon: "گیم‌پلی",
    children: [
      {
        name: "تریلرها",
        description: "تریلر رسمی، معرفی و نمایش سینمایی بازی‌ها.",
        icon: "تریلر",
      },
      {
        name: "گیم‌پلی‌ها",
        description: "ویدئوها و نمایش مستقیم روند بازی.",
        icon: "گیم‌پلی",
      },
      {
        name: "بازی‌های برتر",
        description: "بازی‌های با امتیاز بالا، منتخب و پیشنهاد ویژه.",
        icon: "امتیاز متاکریتیک",
      },
      {
        name: "بازی‌های جدید",
        description: "بازی‌هایی که تازه منتشر شده‌اند یا در صف انتشار هستند.",
        icon: "تاریخ انتشار",
      },
    ],
  },
  {
    name: "خوراکی و سوغات",
    description: "دسته اصلی خوراکی‌های سنتی، شیرینی‌ها و سوغات ایرانی.",
    icon: "محصولات",
    children: [
      {
        name: "نقل",
        description: "انواع نقل سنتی، مغزدار، طعم‌دار و مناسب پذیرایی.",
        icon: "محصولات",
        children: [
          {
            name: "نقل ساده",
            description: "نقل سفید و کلاسیک برای پذیرایی روزمره و مراسم.",
            icon: "محصولات",
          },
          {
            name: "نقل مغزدار",
            description: "نقل با مغزهایی مثل گردو، بادام، پسته و فندق.",
            icon: "محصولات",
          },
          {
            name: "نقل طعم‌دار",
            description: "نقل با طعم‌هایی مثل بیدمشک، زعفران، هل، دارچین و گل‌محمدی.",
            icon: "محصولات",
          },
        ],
      },
      {
        name: "حلوا",
        description: "انواع حلوا و شیرینی‌های سنتی مناسب مصرف خانگی، مراسم و سوغات.",
        icon: "محصولات",
        children: [
          {
            name: "حلوا سنتی",
            description: "حلواهای آردی و خانگی با طعم‌های کلاسیک ایرانی.",
            icon: "محصولات",
          },
          {
            name: "حلوا ارده",
            description: "حلوا ارده، شکری و کنجدی برای صبحانه و میان‌وعده.",
            icon: "محصولات",
          },
          {
            name: "حلوا مجلسی",
            description: "حلواهای قالبی، لقمه‌ای و مناسب مراسم.",
            icon: "محصولات",
          },
        ],
      },
      {
        name: "عرقیات گیاهی",
        description: "عرقیات سنتی و گیاهی برای مصرف خانگی، نوشیدنی و کاربردهای روزمره.",
        icon: "محصولات",
        children: [
          {
            name: "عرقیات آرام‌بخش",
            description: "عرقیاتی مثل بیدمشک، بهارنارنج و گلاب برای نوشیدنی و آرامش.",
            icon: "محصولات",
          },
          {
            name: "عرقیات گوارشی",
            description: "عرقیاتی مثل نعناع، کاسنی و شاتره برای مصرف روزمره.",
            icon: "محصولات",
          },
          {
            name: "گلاب و عرق گل",
            description: "گلاب و عرق گل‌های معطر برای خوراکی، نوشیدنی و شیرینی‌پزی.",
            icon: "محصولات",
          },
        ],
      },
    ],
  },
];

async function iconMapByName() {
  const icons = await Icon.find({ isDeleted: false }).select("_id name").lean();
  return icons.reduce((map, item) => {
    map[item.name] = item._id;
    return map;
  }, {});
}

async function upsertCategory(item, parentId, iconsByName) {
  const update = {
    name: item.name,
    description: item.description,
    icon: iconsByName[item.icon] || null,
    parent: parentId || null,
    status: "active",
    isDeleted: false,
    deletedAt: null,
  };

  const category = await Category.findOneAndUpdate(
    { name: item.name, parent: parentId || null },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  for (const child of item.children || []) {
    await upsertCategory(child, category._id, iconsByName);
  }
}

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const iconsByName = await iconMapByName();

  for (const category of categories) {
    await upsertCategory(category, null, iconsByName);
  }

  const total = await Category.countDocuments({ isDeleted: false });
  console.log(`Categories seeded without images. active=${total}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
