function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function limitText(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? text.slice(0, maxLength).trim() : text;
}

function uniqueList(items) {
  const seen = new Set();
  return items
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function buildGameSeoTitle(title) {
  const gameTitle = String(title || "").trim();
  return limitText(gameTitle ? `خرید و دانلود بازی ${gameTitle}` : "", 160);
}

function buildGameSeoDescription({ description = "", summary = "", title = "" } = {}) {
  const gameTitle = String(title || "").trim();
  const intro = stripHtml(summary || description);
  const fallback = gameTitle
    ? `خرید اکانت قانونی و دانلود بازی ${gameTitle} برای پلی استیشن؛ مشاهده قیمت، ظرفیت‌ها، نسخه‌ها، توضیحات و لینک‌های دانلود بازی ${gameTitle}.`
    : intro;

  return limitText(fallback || intro, 320);
}

function buildGameSeoKeywords(title, extraKeywords = []) {
  const gameTitle = String(title || "").trim();
  if (!gameTitle) return uniqueList(extraKeywords).map((item) => limitText(item, 80));

  return uniqueList([
    gameTitle,
    `خرید اکانت بازی ${gameTitle}`,
    `خرید بازی ${gameTitle}`,
    `دانلود بازی ${gameTitle}`,
    `دانلود بازی ${gameTitle} برای PS4`,
    `دانلود بازی ${gameTitle} برای PS5`,
    `اکانت قانونی ${gameTitle}`,
    `خرید ظرفیت بازی ${gameTitle}`,
    `قیمت بازی ${gameTitle}`,
    `بازی ${gameTitle} پلی استیشن`,
    ...extraKeywords,
  ]).map((item) => limitText(item, 80));
}

function buildGameDynamicTagNames(title) {
  return buildGameSeoKeywords(title).filter((item) => item.length <= 100);
}

function buildGameSeoPayload(game = {}) {
  return {
    seoTitle: buildGameSeoTitle(game.title),
    seoDescription: buildGameSeoDescription(game),
    seoKeywords: buildGameSeoKeywords(game.title, game.seoKeywords),
  };
}

module.exports = {
  buildGameDynamicTagNames,
  buildGameSeoDescription,
  buildGameSeoKeywords,
  buildGameSeoPayload,
  buildGameSeoTitle,
};
