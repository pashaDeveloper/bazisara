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
  { label: "Ù†Ø¯Ø§Ø±Ø¯", value: "offline_none" },
  { label: "ØªÚ© Ù†ÙØ±Ù‡", value: "offline_1" },
  { label: "1-2 Ù†ÙØ±Ù‡", value: "offline_1_2" },
  { label: "1-3 Ù†ÙØ±Ù‡", value: "offline_1_3" },
  { label: "1-4 Ù†ÙØ±Ù‡", value: "offline_1_4" },
  { label: "Ø¯Ùˆ Ù†ÙØ±Ù‡", value: "offline_2" },
];

export const onlinePlayerOptions = [
  { label: "Ø¨Ø§Ø²ÛŒÚ©Ù†Ø§Ù† Ø¢Ù†Ù„Ø§ÛŒÙ† Ù…ÙˆÙ„ØªÛŒ", value: "online_multi" },
  { label: "Ø¨Ø§Ø²ÛŒÚ©Ù†Ø§Ù† Ø¢Ù†Ù„Ø§ÛŒÙ† Ú©ÙˆØ¢Ù¾", value: "online_coop" },
];

export const gameModeOptions = [
  { label: "Ø¯Ø§Ø³ØªØ§Ù†ÛŒ", value: "story" },
  { label: "Ú©ÙˆØ¢Ù¾", value: "coop" },
  { label: "Ù…ÙˆÙ„ØªÛŒâ€ŒÙ¾Ù„ÛŒØ±", value: "multiplayer" },
  { label: "Ø¢ÙÙ„Ø§ÛŒÙ†", value: "offline" },
  { label: "Ø¢Ù†Ù„Ø§ÛŒÙ†", value: "online" },
  { label: "Ø±Ù‚Ø§Ø¨ØªÛŒ", value: "competitive" },
  { label: "Ø¬Ù‡Ø§Ù†â€ŒØ¨Ø§Ø²", value: "open_world" },
];

export const dlcTypeOptions = [
  { label: "Story - Ø¯Ø§Ø³ØªØ§Ù†ÛŒ", value: "story" },
  { label: "Item - Ø¢ÛŒØªÙ…", value: "item" },
  { label: "Map - Ù†Ù‚Ø´Ù‡", value: "map" },
  { label: "Character - Ø´Ø®ØµÛŒØª", value: "character" },
  { label: "Car - Ù…Ø§Ø´ÛŒÙ†", value: "car" },
  { label: "Motor - Ù…ÙˆØªÙˆØ±", value: "motor" },
  { label: "Stage - Ù…Ø±Ø­Ù„Ù‡", value: "stage" },
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
  { label: "PlayStation Store - Ù¾Ù„ÛŒâ€ŒØ§Ø³ØªÛŒØ´Ù† Ø§Ø³ØªÙˆØ±", value: "Ù¾Ù„ÛŒâ€ŒØ§Ø³ØªÛŒØ´Ù† Ø§Ø³ØªÙˆØ±", legacyValues: ["PlayStation Store"] },
  { label: "Steam - Ø§Ø³ØªÛŒÙ…", value: "Ø§Ø³ØªÛŒÙ…", legacyValues: ["Steam"] },
  { label: "Epic Games Store - Ø§Ù¾ÛŒÚ© Ú¯ÛŒÙ…Ø² Ø§Ø³ØªÙˆØ±", value: "Ø§Ù¾ÛŒÚ© Ú¯ÛŒÙ…Ø² Ø§Ø³ØªÙˆØ±", legacyValues: ["Epic Games Store"] },
  { label: "Xbox Store - Ø§ÛŒÚ©Ø³â€ŒØ¨Ø§Ú©Ø³ Ø§Ø³ØªÙˆØ±", value: "Ø§ÛŒÚ©Ø³â€ŒØ¨Ø§Ú©Ø³ Ø§Ø³ØªÙˆØ±", legacyValues: ["Xbox Store"] },
  { label: "Nintendo eShop - Ù†ÛŒÙ†ØªÙ†Ø¯Ùˆ Ø§ÛŒâ€ŒØ´Ø§Ù¾", value: "Ù†ÛŒÙ†ØªÙ†Ø¯Ùˆ Ø§ÛŒâ€ŒØ´Ø§Ù¾", legacyValues: ["Nintendo eShop"] },
  { label: "Google Play - Ú¯ÙˆÚ¯Ù„ Ù¾Ù„ÛŒ", value: "Ú¯ÙˆÚ¯Ù„ Ù¾Ù„ÛŒ", legacyValues: ["Google Play"] },
  { label: "App Store - Ø§Ù¾ Ø§Ø³ØªÙˆØ±", value: "Ø§Ù¾ Ø§Ø³ØªÙˆØ±", legacyValues: ["App Store"] },
];

export const editionOptions = [
  { label: "Standard - Ø§Ø³ØªØ§Ù†Ø¯Ø§Ø±Ø¯", value: "Ø§Ø³ØªØ§Ù†Ø¯Ø§Ø±Ø¯", legacyValues: ["Standard"] },
  { label: "Deluxe - Ø¯ÛŒÙ„Ø§Ú©Ø³", value: "Ø¯ÛŒÙ„Ø§Ú©Ø³", legacyValues: ["Deluxe"] },
  { label: "Ultimate - Ø¢Ù„ØªÛŒÙ…ÛŒØª", value: "Ø¢Ù„ØªÛŒÙ…ÛŒØª", legacyValues: ["Ultimate"] },
  { label: "Gold - Ú¯Ù„Ø¯", value: "Ú¯Ù„Ø¯", legacyValues: ["Gold"] },
  { label: "Collector's - Ú©Ø§Ù„Ú©ØªÙˆØ±", value: "Ú©Ø§Ù„Ú©ØªÙˆØ±", legacyValues: ["Collector's"] },
  { label: "Complete - Ú©Ø§Ù…Ù„", value: "Ú©Ø§Ù…Ù„", legacyValues: ["Complete"] },
];


