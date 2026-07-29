export const platformOptions = [
  { label: "PC", value: "PC" },
  { label: "PlayStation 5", value: "PS5" },
  { label: "PlayStation 4", value: "PS4" },
  { label: "Xbox Series X/S", value: "Xbox Series" },
  { label: "Xbox One", value: "Xbox One" },
  { label: "Nintendo Switch", value: "Nintendo Switch" },
  { label: "Android", value: "Android" },
  { label: "iOS", value: "iOS" },
];

export const offlinePlayerOptions = [
  {
    key: "none",
    label: "نداره",
    max: 0,
    min: 0,
    title_en: "No offline players",
    title_fa: "نداره",
    value: "none",
  },
  {
    key: "single-player",
    label: "تک نفره",
    max: 1,
    min: 1,
    title_en: "Single-player",
    title_fa: "تک نفره",
    value: "single-player",
  },
  {
    key: "1-2",
    label: "۱ - ۲ نفره",
    max: 2,
    min: 1,
    title_en: "1-2 players",
    title_fa: "۱ - ۲ نفره",
    value: "1-2",
  },
  {
    key: "1-3",
    label: "۱ - ۳ نفره",
    max: 3,
    min: 1,
    title_en: "1-3 players",
    title_fa: "۱ - ۳ نفره",
    value: "1-3",
  },
  {
    key: "1-4",
    label: "۱ - ۴ نفره",
    max: 4,
    min: 1,
    title_en: "1-4 players",
    title_fa: "۱ - ۴ نفره",
    value: "1-4",
  },
  {
    key: "2",
    label: "۲ نفره",
    max: 2,
    min: 2,
    title_en: "2 players",
    title_fa: "۲ نفره",
    value: "2",
  },
];

export const onlinePlayerOptions = [
  { label: "بازیکنان آنلاین مولتی", value: "online_multi" },
  { label: "بازیکنان آنلاین کوآپ", value: "online_coop" },
];

export const gameModeOptions = [
  { label: "داستانی", value: "story" },
  { label: "کوآپ", value: "coop" },
  { label: "مولتی‌پلیر", value: "multiplayer" },
  { label: "آفلاین", value: "offline" },
  { label: "آنلاین", value: "online" },
  { label: "رقابتی", value: "competitive" },
  { label: "جهان‌باز", value: "open_world" },
];

export const dlcTypeOptions = [
  { label: "Story - داستانی", value: "story" },
  { label: "Item - آیتم", value: "item" },
  { label: "Map - نقشه", value: "map" },
  { label: "Character - شخصیت", value: "character" },
  { label: "Car - ماشین", value: "car" },
  { label: "Motor - موتور", value: "motor" },
  { label: "Stage - مرحله", value: "stage" },
];

export const ageRatingOptions = [
  {
    key: "everyone",
    label: "همه سنین / Everyone",
    title_en: "Everyone",
    title_fa: "همه سنین",
    value: "everyone",
    legacyValues: ["Everyone", "همه سنین", "مناسب همه", "PEGI 3", "پگی ۳"],
  },
  {
    key: "everyone_10",
    label: "کودکان / Everyone 10+",
    title_en: "Everyone 10+",
    title_fa: "کودکان",
    value: "everyone_10",
    legacyValues: ["Everyone 10+", "کودکان", "مناسب بالای ۱۰ سال", "PEGI 7", "پگی ۷"],
  },
  {
    key: "teen",
    label: "نوجوانان / Teen",
    title_en: "Teen",
    title_fa: "نوجوانان",
    value: "teen",
    legacyValues: ["Teen", "نوجوانان", "مناسب نوجوانان", "PEGI 12", "PEGI 16", "پگی ۱۲", "پگی ۱۶"],
  },
  {
    key: "mature",
    label: "بزرگسالان / Mature 17+",
    title_en: "Mature 17+",
    title_fa: "بزرگسالان",
    value: "mature",
    legacyValues: ["Mature 17+", "Adults Only 18+", "+18", "+18 / PEGI 18", "PEGI 18", "بزرگسالان", "مناسب بالای ۱۷ سال", "مناسب بالای ۱۸ سال", "پگی ۱۸"],
  },
];
export const launcherOptions = [
  { label: "PlayStation Store - پلی‌استیشن استور", value: "پلی‌استیشن استور", legacyValues: ["PlayStation Store", "Ù¾Ù„ÛŒâ€ŒØ§Ø³ØªÛŒØ´Ù† Ø§Ø³ØªÙˆØ±"] },
  { label: "Steam - استیم", value: "استیم", legacyValues: ["Steam", "Ø§Ø³ØªÛŒÙ…"] },
  { label: "Epic Games Store - اپیک گیمز استور", value: "اپیک گیمز استور", legacyValues: ["Epic Games Store", "Ø§Ù¾ÛŒÚ© Ú¯ÛŒÙ…Ø² Ø§Ø³ØªÙˆØ±"] },
  { label: "Xbox Store - ایکس‌باکس استور", value: "ایکس‌باکس استور", legacyValues: ["Xbox Store", "Ø§ÛŒÚ©Ø³â€ŒØ¨Ø§Ú©Ø³ Ø§Ø³ØªÙˆØ±"] },
  { label: "Nintendo eShop - نینتندو ای‌شاپ", value: "نینتندو ای‌شاپ", legacyValues: ["Nintendo eShop", "Ù†ÛŒÙ†ØªÙ†Ø¯Ùˆ Ø§ÛŒâ€ŒØ´Ø§Ù¾"] },
  { label: "Google Play - گوگل پلی", value: "گوگل پلی", legacyValues: ["Google Play", "Ú¯ÙˆÚ¯Ù„ Ù¾Ù„ÛŒ"] },
  { label: "App Store - اپ استور", value: "اپ استور", legacyValues: ["App Store", "Ø§Ù¾ Ø§Ø³ØªÙˆØ±"] },
];

export const editionOptions = [
  { label: "Standard - استاندارد", value: "استاندارد", legacyValues: ["Standard", "Ø§Ø³ØªØ§Ù†Ø¯Ø§Ø±Ø¯"] },
  { label: "Deluxe - دیلاکس", value: "دیلاکس", legacyValues: ["Deluxe", "Ø¯ÛŒÙ„Ø§Ú©Ø³"] },
  { label: "Ultimate - آلتیمیت", value: "آلتیمیت", legacyValues: ["Ultimate", "Ø¢Ù„ØªÛŒÙ…ÛŒØª"] },
  { label: "Gold - گلد", value: "گلد", legacyValues: ["Gold", "Ú¯Ù„Ø¯"] },
  { label: "Collector's - کالکتور", value: "کالکتور", legacyValues: ["Collector's", "Ú©Ø§Ù„Ú©ØªÙˆØ±"] },
  { label: "Complete - کامل", value: "کامل", legacyValues: ["Complete", "Ú©Ø§Ù…Ù„"] },
];


