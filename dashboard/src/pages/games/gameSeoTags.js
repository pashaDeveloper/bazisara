export function makeSeoTagSlug(value) {
  return String(value || "").trim().toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "")
    .replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function buildSelectableSeoTags(title) {
  const gameName = String(title || "").trim();
  if (!gameName) return [];
  return [
    `خرید ${gameName}`,
    `قیمت ${gameName}`,
    `خرید بازی ${gameName}`,
    `اکانت ${gameName}`,
    `دیسک ${gameName}`,
    `${gameName} PS5`,
    `${gameName} Xbox Series`,
  ];
}
