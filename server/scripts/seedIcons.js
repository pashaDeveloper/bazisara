const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const Icon = require("../models/icon.model");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const previouslySeededGenericIcons = [
  "خانه",
  "فروشگاه",
  "سبد خرید",
  "دسته‌بندی",
  "تخفیف",
  "کاربر",
  "پرداخت",
  "جستجو",
  "فیلتر",
  "تنظیمات",
  "اعلان",
  "پشتیبانی",
];

const icon = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const icons = [
  {
    name: "بازی",
    color: "#a855f7",
    svg: icon('<path d="M6.5 9h11A4.5 4.5 0 0 1 22 13.5v1A3.5 3.5 0 0 1 18.5 18c-1.2 0-2-.6-2.8-1.5h-7.4C7.5 17.4 6.7 18 5.5 18A3.5 3.5 0 0 1 2 14.5v-1A4.5 4.5 0 0 1 6.5 9Z"/><path d="M7 12v3"/><path d="M5.5 13.5h3"/><path d="M16.5 13h.01"/><path d="M18.5 15h.01"/>'),
  },
  {
    name: "ژانر",
    color: "#f59e0b",
    svg: icon('<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/><path d="M8 3v4"/><path d="M15 10v4"/><path d="M11 17v4"/>'),
  },
  {
    name: "اکشن",
    color: "#ef4444",
    svg: icon('<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>'),
  },
  {
    name: "ماجراجویی",
    color: "#22c55e",
    svg: icon('<path d="m12 2 8 20-8-4-8 4 8-20Z"/><path d="M12 2v16"/>'),
  },
  {
    name: "نقش‌آفرینی",
    color: "#8b5cf6",
    svg: icon('<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"/><path d="M9 12h6"/><path d="M12 9v6"/>'),
  },
  {
    name: "شوتر",
    color: "#64748b",
    svg: icon('<path d="M4 13h10l2-3h4v5h-3l-2 3H9l-1-3H4v-2Z"/><path d="M8 13v-2"/><path d="M18 10V8"/>'),
  },
  {
    name: "ترسناک",
    color: "#f43f5e",
    svg: icon('<path d="M12 3a7 7 0 0 0-7 7v8l2-1.5L9 18l3-1.5L15 18l2-1.5L19 18v-8a7 7 0 0 0-7-7Z"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M10 14h4"/>'),
  },
  {
    name: "مسابقه‌ای",
    color: "#06b6d4",
    svg: icon('<path d="M5 16h14l-1-5a3 3 0 0 0-3-2H9a3 3 0 0 0-3 2l-1 5Z"/><path d="M7 16v3"/><path d="M17 16v3"/><path d="M8 13h.01"/><path d="M16 13h.01"/><path d="M9 9l1-3h4l1 3"/>'),
  },
  {
    name: "ورزشی",
    color: "#84cc16",
    svg: icon('<circle cx="12" cy="12" r="9"/><path d="M8 5.5 12 9l4-3.5"/><path d="m7 18 2-5-4-3"/><path d="m17 18-2-5 4-3"/><path d="M9 13h6"/>'),
  },
  {
    name: "استراتژی",
    color: "#eab308",
    svg: icon('<path d="M8 4h8v4H8z"/><path d="M6 12h5v4H6z"/><path d="M13 12h5v4h-5z"/><path d="M12 8v4"/><path d="M8.5 12v-2h7v2"/>'),
  },
  {
    name: "پازل",
    color: "#14b8a6",
    svg: icon('<path d="M8 4h5a2 2 0 1 1 4 0h3v6h-3a2 2 0 1 0 0 4h3v6h-6v-3a2 2 0 1 0-4 0v3H4v-6h3a2 2 0 1 0 0-4H4V4h4Z"/>'),
  },
  {
    name: "جهان‌باز",
    color: "#38bdf8",
    svg: icon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>'),
  },
  {
    name: "شبیه‌ساز",
    color: "#0ea5e9",
    svg: icon('<path d="M4 17h16"/><path d="M7 17V8l5-3 5 3v9"/><path d="M9 17v-5h6v5"/><path d="M10 9h.01"/><path d="M14 9h.01"/>'),
  },
  {
    name: "مبارزه‌ای",
    color: "#fb7185",
    svg: icon('<path d="M7 13 3 9l3-3 4 4"/><path d="m17 13 4-4-3-3-4 4"/><path d="M9 11h6"/><path d="M8 16h8"/><path d="M10 20h4"/>'),
  },
  {
    name: "بقا",
    color: "#65a30d",
    svg: icon('<path d="M12 2 5 9c-4 4 0 11 7 11s11-7 7-11l-7-7Z"/><path d="M12 7v8"/><path d="m9 12 3 3 3-3"/>'),
  },
  {
    name: "فانتزی",
    color: "#c084fc",
    svg: icon('<path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z"/><path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z"/>'),
  },
  {
    name: "علمی‌تخیلی",
    color: "#60a5fa",
    svg: icon('<path d="M12 3c3 2 5 5 5 9s-2 7-5 9c-3-2-5-5-5-9s2-7 5-9Z"/><path d="M9 12h6"/><path d="M12 9v6"/><path d="M5 6l3 2"/><path d="m19 6-3 2"/>'),
  },
  {
    name: "پلتفرمر",
    color: "#f97316",
    svg: icon('<path d="M4 18h6"/><path d="M14 18h6"/><path d="M7 14h10"/><path d="M10 10h4"/><path d="M12 6h.01"/>'),
  },
  {
    name: "پلتفرم",
    color: "#2563eb",
    svg: icon('<path d="M5 6h14a2 2 0 0 1 2 2v7H3V8a2 2 0 0 1 2-2Z"/><path d="M2 18h20"/><path d="M9 21h6"/>'),
  },
  {
    name: "PC",
    color: "#94a3b8",
    svg: icon('<path d="M4 5h16v11H4z"/><path d="M9 20h6"/><path d="M12 16v4"/>'),
  },
  {
    name: "PlayStation",
    color: "#3b82f6",
    svg: icon('<path d="M7 8v8"/><path d="M7 8h4a3 3 0 0 1 0 6H7"/><path d="M14 16h5"/><path d="M16.5 13v6"/>'),
  },
  {
    name: "Xbox",
    color: "#22c55e",
    svg: icon('<circle cx="12" cy="12" r="9"/><path d="m7 7 10 10"/><path d="m17 7-10 10"/>'),
  },
  {
    name: "Nintendo Switch",
    color: "#ef4444",
    svg: icon('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M11 4v16"/><circle cx="8" cy="9" r="1"/><circle cx="16" cy="15" r="1"/>'),
  },
  {
    name: "تریلر",
    color: "#dc2626",
    svg: icon('<path d="M4 6h16v12H4z"/><path d="m10 9 5 3-5 3V9Z"/>'),
  },
  {
    name: "گیم‌پلی",
    color: "#84cc16",
    svg: icon('<path d="M8 5v14"/><path d="M16 5v14"/><path d="M3 8h18"/><path d="M3 16h18"/><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>'),
  },
  {
    name: "امتیاز متاکریتیک",
    color: "#facc15",
    svg: icon('<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z"/><path d="M9 12h6"/>'),
  },
  {
    name: "رده سنی",
    color: "#f59e0b",
    svg: icon('<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"/><path d="M9 13h6"/><path d="M9 10h6"/>'),
  },
  {
    name: "تاریخ انتشار",
    color: "#2dd4bf",
    svg: icon('<path d="M5 4h14v16H5z"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M5 9h14"/><path d="M9 13h.01"/><path d="M13 13h.01"/><path d="M17 13h.01"/>'),
  },
  {
    name: "سازنده بازی",
    color: "#f43f5e",
    svg: icon('<path d="M14.7 6.3a3 3 0 1 0-4.2 4.2L4 17v3h3l6.5-6.5a3 3 0 0 0 1.2-7.2Z"/><path d="m13 8 3 3"/>'),
  },
  {
    name: "ناشر بازی",
    color: "#06b6d4",
    svg: icon('<path d="M4 19.5V5a2 2 0 0 1 2-2h11v18H6a2 2 0 0 1-2-1.5Z"/><path d="M8 7h5"/><path d="M8 11h6"/><path d="M8 15h4"/>'),
  },
];

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  await Icon.updateMany(
    { name: { $in: previouslySeededGenericIcons }, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" }
  );

  const result = await Icon.bulkWrite(
    icons.map((item) => ({
      updateOne: {
        filter: { name: item.name },
        update: {
          $set: {
            ...item,
            status: "active",
            isDeleted: false,
            deletedAt: null,
          },
        },
        upsert: true,
      },
    }))
  );

  console.log(`Game icons seeded. inserted=${result.upsertedCount}, modified=${result.modifiedCount}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
