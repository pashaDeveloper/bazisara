const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Genre = require("../models/genre.model");
const Icon = require("../models/icon.model");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const genres = [
  {
    name: "اکشن",
    description: "بازی‌های سریع، مبارزه‌محور و پرهیجان با تمرکز روی واکنش و درگیری.",
    icon: "اکشن",
  },
  {
    name: "ماجراجویی",
    description: "بازی‌های داستانی و اکتشافی با تمرکز روی سفر، روایت و کشف محیط.",
    icon: "ماجراجویی",
  },
  {
    name: "نقش‌آفرینی",
    description: "بازی‌های RPG با پیشرفت شخصیت، انتخاب‌های داستانی و جهان‌های عمیق.",
    icon: "نقش‌آفرینی",
  },
  {
    name: "شوتر",
    description: "بازی‌های تیراندازی اول‌شخص یا سوم‌شخص با گیم‌پلی سریع و رقابتی.",
    icon: "شوتر",
  },
  {
    name: "ترسناک",
    description: "بازی‌های وحشت و بقا با فضای پرتنش، معما و مدیریت منابع.",
    icon: "ترسناک",
  },
  {
    name: "مسابقه‌ای",
    description: "بازی‌های رانندگی، موتورسواری و رقابت‌های سرعتی.",
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
    description: "بازی‌های معمایی، فکری و حل مسئله برای چالش ذهنی.",
    icon: "پازل",
  },
  {
    name: "جهان‌باز",
    description: "بازی‌های Open World با نقشه بزرگ، آزادی عمل و محتوای گسترده.",
    icon: "جهان‌باز",
  },
  {
    name: "شبیه‌ساز",
    description: "بازی‌های شبیه‌سازی رانندگی، پرواز، مدیریت و تجربه‌های واقع‌گرایانه.",
    icon: "شبیه‌ساز",
  },
  {
    name: "مبارزه‌ای",
    description: "بازی‌های فایتینگ و مبارزه تن‌به‌تن با کمبوها و رقابت مستقیم.",
    icon: "مبارزه‌ای",
  },
  {
    name: "بقا",
    description: "بازی‌های Survival با تمرکز روی ساخت‌وساز، منابع و زنده‌ماندن.",
    icon: "بقا",
  },
  {
    name: "فانتزی",
    description: "بازی‌هایی با جهان‌های جادویی، اسطوره‌ای و داستان‌های حماسی.",
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
];

async function iconMapByName() {
  const icons = await Icon.find({ isDeleted: false }).select("_id name").lean();
  return icons.reduce((map, item) => {
    map[item.name] = item._id;
    return map;
  }, {});
}

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const iconsByName = await iconMapByName();
  const result = await Genre.bulkWrite(
    genres.map((item) => ({
      updateOne: {
        filter: { name: item.name },
        update: {
          $set: {
            name: item.name,
            description: item.description,
            icon: iconsByName[item.icon] || null,
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
    }))
  );

  const total = await Genre.countDocuments({ isDeleted: false });
  console.log(`Genres seeded without images. inserted=${result.upsertedCount}, modified=${result.modifiedCount}, active=${total}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
