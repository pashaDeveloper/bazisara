const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Company = require("../models/company.model");
const Icon = require("../models/icon.model");

const mongoUri =
  process.env.MONGO_URI ||
  process.env.ATLAS_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const companies = [
  {
    name: "Sony Interactive Entertainment",
    type: "publisher",
    country: "Japan / United States",
    foundedYear: 1993,
    website: "https://www.playstation.com",
    icon: "ناشر بازی",
    description: "ناشر و مالک برند PlayStation با مجموعه‌ای بزرگ از بازی‌های انحصاری و استودیوهای فرست‌پارتی.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/PlayStation" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/user/PlayStation" },
    ],
  },
  {
    name: "Microsoft Xbox Game Studios",
    type: "publisher",
    country: "United States",
    foundedYear: 2000,
    website: "https://www.xbox.com",
    icon: "ناشر بازی",
    description: "بازوی انتشار بازی‌های Xbox و مالک چندین استودیوی مطرح برای تولید بازی‌های کنسولی و کامپیوتر.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/Xbox" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/user/xbox" },
    ],
  },
  {
    name: "Nintendo",
    type: "developer_publisher",
    country: "Japan",
    foundedYear: 1889,
    website: "https://www.nintendo.com",
    icon: "سازنده بازی",
    description: "سازنده و ناشر ژاپنی با فرنچایزهای شناخته‌شده و تمرکز ویژه روی تجربه‌های خانوادگی و خلاقانه.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/NintendoAmerica" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/nintendo" },
    ],
  },
  {
    name: "Ubisoft",
    type: "developer_publisher",
    country: "France",
    foundedYear: 1986,
    website: "https://www.ubisoft.com",
    icon: "سازنده بازی",
    description: "کمپانی فرانسوی سازنده و ناشر بازی‌هایی مثل Assassin's Creed، Far Cry، Watch Dogs و Rainbow Six.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/Ubisoft" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/ubisoft" },
    ],
  },
  {
    name: "Electronic Arts",
    type: "developer_publisher",
    country: "United States",
    foundedYear: 1982,
    website: "https://www.ea.com",
    icon: "سازنده بازی",
    description: "سازنده و ناشر بازی‌های ورزشی، مسابقه‌ای، اکشن و سرویس‌محور با برندهایی مثل EA Sports و Battlefield.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/EA" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/ea" },
    ],
  },
  {
    name: "Activision",
    type: "publisher",
    country: "United States",
    foundedYear: 1979,
    website: "https://www.activision.com",
    icon: "ناشر بازی",
    description: "ناشر بازی‌های اکشن و شوتر، شناخته‌شده با مجموعه Call of Duty و چندین عنوان پرمخاطب دیگر.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/Activision" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/activision" },
    ],
  },
  {
    name: "Bethesda Softworks",
    type: "publisher",
    country: "United States",
    foundedYear: 1986,
    website: "https://bethesda.net",
    icon: "ناشر بازی",
    description: "ناشر بازی‌های نقش‌آفرینی، جهان‌باز و اکشن با مجموعه‌هایی مثل The Elder Scrolls، Fallout و DOOM.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/bethesda" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/bethesda" },
    ],
  },
  {
    name: "Rockstar Games",
    type: "developer_publisher",
    country: "United States",
    foundedYear: 1998,
    website: "https://www.rockstargames.com",
    icon: "سازنده بازی",
    description: "سازنده و ناشر مجموعه‌های جهان‌باز بزرگ مثل Grand Theft Auto و Red Dead Redemption.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/RockstarGames" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/rockstargames" },
    ],
  },
  {
    name: "CD Projekt Red",
    type: "developer",
    country: "Poland",
    foundedYear: 2002,
    website: "https://www.cdprojektred.com",
    icon: "سازنده بازی",
    description: "استودیوی لهستانی سازنده بازی‌های داستانی و نقش‌آفرینی مثل The Witcher و Cyberpunk 2077.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/CDPROJEKTRED" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/user/CDPRED" },
    ],
  },
  {
    name: "FromSoftware",
    type: "developer",
    country: "Japan",
    foundedYear: 1986,
    website: "https://www.fromsoftware.jp",
    icon: "سازنده بازی",
    description: "استودیوی ژاپنی سازنده بازی‌های اکشن نقش‌آفرینی سخت و اتمسفریک مثل Dark Souls، Bloodborne و Elden Ring.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/fromsoftware_pr" },
    ],
  },
  {
    name: "Capcom",
    type: "developer_publisher",
    country: "Japan",
    foundedYear: 1979,
    website: "https://www.capcom-games.com",
    icon: "سازنده بازی",
    description: "سازنده و ناشر ژاپنی با مجموعه‌هایی مثل Resident Evil، Monster Hunter، Street Fighter و Devil May Cry.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/CapcomUSA_" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/capcom" },
    ],
  },
  {
    name: "Square Enix",
    type: "developer_publisher",
    country: "Japan",
    foundedYear: 2003,
    website: "https://www.square-enix-games.com",
    icon: "سازنده بازی",
    description: "سازنده و ناشر ژاپنی شناخته‌شده برای Final Fantasy، Dragon Quest، Kingdom Hearts و بازی‌های نقش‌آفرینی.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/SquareEnix" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/squareenixna" },
    ],
  },
  {
    name: "SEGA",
    type: "developer_publisher",
    country: "Japan",
    foundedYear: 1960,
    website: "https://www.sega.com",
    icon: "سازنده بازی",
    description: "سازنده و ناشر ژاپنی با مجموعه‌هایی مثل Sonic، Yakuza / Like a Dragon و Persona از طریق Atlus.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/SEGA" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/sega" },
    ],
  },
  {
    name: "Bandai Namco Entertainment",
    type: "developer_publisher",
    country: "Japan",
    foundedYear: 2006,
    website: "https://www.bandainamcoent.com",
    icon: "سازنده بازی",
    description: "سازنده و ناشر بازی‌های اکشن، مبارزه‌ای و انیمه‌محور با مجموعه‌هایی مثل Tekken، Ace Combat و Tales.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/BandaiNamcoUS" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/bandainamcoentertainment" },
    ],
  },
  {
    name: "Warner Bros. Games",
    type: "publisher",
    country: "United States",
    foundedYear: 2004,
    website: "https://www.wbgames.com",
    icon: "ناشر بازی",
    description: "ناشر بازی‌های مبتنی بر برندهای سینمایی و کمیک، از جمله Mortal Kombat، Batman Arkham و Hogwarts Legacy.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/wbgames" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/wbgames" },
    ],
  },
  {
    name: "Take-Two Interactive",
    type: "publisher",
    country: "United States",
    foundedYear: 1993,
    website: "https://www.take2games.com",
    icon: "ناشر بازی",
    description: "ناشر بزرگ بازی‌های ویدیویی و شرکت مادر برندهایی مثل Rockstar Games و 2K.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/Take2Interact" },
    ],
  },
  {
    name: "2K",
    type: "publisher",
    country: "United States",
    foundedYear: 2005,
    website: "https://2k.com",
    icon: "ناشر بازی",
    description: "ناشر بازی‌های ورزشی، استراتژی، اکشن و داستانی با مجموعه‌هایی مثل NBA 2K، BioShock و Civilization.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/2K" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/2K" },
    ],
  },
  {
    name: "Valve",
    type: "developer_publisher",
    country: "United States",
    foundedYear: 1996,
    website: "https://www.valvesoftware.com",
    icon: "سازنده بازی",
    description: "سازنده بازی‌هایی مثل Half-Life، Portal و Counter-Strike و مالک پلتفرم توزیع دیجیتال Steam.",
    socialLinks: [
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/user/Valve" },
    ],
  },
  {
    name: "Epic Games",
    type: "developer_publisher",
    country: "United States",
    foundedYear: 1991,
    website: "https://www.epicgames.com",
    icon: "سازنده بازی",
    description: "سازنده Unreal Engine، Fortnite و ناشر/فروشگاه دیجیتال Epic Games Store.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/EpicGames" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/epicgames" },
    ],
  },
  {
    name: "Riot Games",
    type: "developer_publisher",
    country: "United States",
    foundedYear: 2006,
    website: "https://www.riotgames.com",
    icon: "سازنده بازی",
    description: "سازنده و ناشر بازی‌های رقابتی آنلاین مثل League of Legends، VALORANT و Teamfight Tactics.",
    socialLinks: [
      { platform: "x", label: "X", url: "https://x.com/riotgames" },
      { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/riotgames" },
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

async function seed() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  const iconsByName = await iconMapByName();
  const result = await Company.bulkWrite(
    companies.map((item) => ({
      updateOne: {
        filter: { name: item.name },
        update: {
          $set: {
            name: item.name,
            description: item.description,
            website: item.website,
            socialLinks: item.socialLinks,
            country: item.country,
            foundedYear: item.foundedYear,
            type: item.type,
            icon: iconsByName[item.icon] || null,
            status: "active",
            isDeleted: false,
            deletedAt: null,
          },
          $setOnInsert: {
            logo: { url: "", public_id: "" },
          },
        },
        upsert: true,
      },
    }))
  );

  const total = await Company.countDocuments({ isDeleted: false });
  console.log(`Companies seeded without logos. inserted=${result.upsertedCount}, modified=${result.modifiedCount}, active=${total}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
