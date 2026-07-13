const mongoose = require("mongoose");
const axios = require("axios");
const translate = require("google-translate-api-x");
const Game = require("../models/game.model");
const Category = require("../models/category.model");
const Genre = require("../models/genre.model");
const Platform = require("../models/platform.model");
const Company = require("../models/company.model");
const Tag = require("../models/tag.model");
const GameCollection = require("../models/gameCollection.model");
const GameKeyword = require("../models/gameKeyword.model");
const FilterDefinition = require("../models/filterDefinition.model");
const {
  buildSearchQuery,
  buildPaginationMeta,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

const populateGame = (query) =>
  query
    .populate("category", "name")
    .populate("genres", "name icon image")
    .populate("platforms", "name name_fa name_en slug parent image fontFile svgIcon")
    .populate("platformReleases.platform", "name name_fa name_en slug parent image fontFile svgIcon")
    .populate("platformSizes.platform", "name slug parent image fontFile svgIcon")
    .populate("developers", "name logo icon")
    .populate("publishers", "name logo icon")
    .populate("tags", "name slug image")
    .populate("gameKeywords", "name title_en slug image")
    .populate("filterDefinitions", "key label type options min max unit")
    .populate("filterValues.genres", "name icon image")
    .populate("collections", "title_fa title_en slug placement visibility")
    .populate("relatedGames", "title slug cover")
    .populate("creator", "name email avatar role adminId");

const ageRatingCatalog = [
  { key: "everyone", title_fa: "همه سنین", title_en: "Everyone" },
  { key: "everyone_10", title_fa: "کودکان", title_en: "Everyone 10+" },
  { key: "teen", title_fa: "نوجوانان", title_en: "Teen" },
  { key: "mature", title_fa: "بزرگسالان", title_en: "Mature 17+" },
];

const ageRatingLegacyMap = new Map(
  ageRatingCatalog.flatMap((item) => {
    const legacyValues = {
      everyone: ["Everyone", "همه سنین", "مناسب همه", "PEGI 3", "پگی ۳"],
      everyone_10: ["Everyone 10+", "کودکانه", "مناسب بالای ۱۰ سال", "PEGI 7", "پگی ۷"],
      teen: ["Teen", "نوجوانان", "مناسب نوجوانان", "PEGI 12", "PEGI 16", "پگی ۱۲", "پگی ۱۶"],
      mature: ["Mature 17+", "Adults Only 18+", "+18", "+18 / PEGI 18", "PEGI 18", "بزرگسالان", "مناسب بالای ۱۷ سال", "مناسب بالای ۱۸ سال", "پگی ۱۸"],
    }[item.key] || [];

    return [item.key, item.title_fa, item.title_en, ...legacyValues].map((value) => [String(value).trim(), item]);
  })
);

function parseAgeRating(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return { key: "", title_fa: "", title_en: "" };

  let raw = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch (_) {
      raw = value;
    }
  }

  if (raw && typeof raw === "object") {
    const key = String(raw.key || raw.value || "").trim();
    const catalogItem = ageRatingLegacyMap.get(key);
    return {
      key: key || catalogItem?.key || "",
      title_fa: String(raw.title_fa || raw.titleFa || raw.label_fa || catalogItem?.title_fa || "").trim(),
      title_en: String(raw.title_en || raw.titleEn || raw.label_en || catalogItem?.title_en || "").trim(),
    };
  }

  const text = String(raw || "").trim();
  const catalogItem = ageRatingLegacyMap.get(text);
  return catalogItem || { key: text, title_fa: text, title_en: "" };
}

function makeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeEnglishSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function hasPersianLetters(value) {
  return /[\u0600-\u06ff]/.test(String(value || ""));
}

async function translateTitleToEnglishSlug(value) {
  const source = String(value || "").trim();
  if (!source) return "";

  const directSlug = makeEnglishSlug(source);
  if (directSlug && !hasPersianLetters(source)) return directSlug;

  try {
    const translated = await translate(source, { from: "fa", to: "en" });
    const translatedText = Array.isArray(translated) ? translated[0]?.text : translated?.text;
    const translatedSlug = makeEnglishSlug(translatedText);
    if (translatedSlug) return translatedSlug;
  } catch (_) {}

  return directSlug || makeSlug(source);
}

async function translateIntroToPersian(value) {
  const source = String(value || "").trim();
  if (!source) return "";
  if (hasPersianLetters(source)) return source;

  const translated = await translate(source, { from: "en", to: "fa" });
  return String(Array.isArray(translated) ? translated[0]?.text || "" : translated?.text || "").trim();
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanStoreIntro(value) {
  let text = stripHtml(value)
    .replace(/To play this game on PS5[\s\S]*?more details\./i, "")
    .replace(/This product entitles you to download both the digital PS4[™\s\S]*?version of this game\.?/i, "")
    .replace(/If you already own the PS4[™\s\S]*?at no extra cost\./i, "")
    .replace(/Owners of a PS4[™\s\S]*?no extra cost\.?/i, "")
    .replace(/See PlayStation\.com\/bc for more details\./i, "")
    .replace(/\s+/g, " ")
    .trim();

  const grabIndex = text.search(/\bgrab your\b/i);
  if (grabIndex > 0 && grabIndex < 220) {
    text = text.slice(grabIndex).trim();
  }

  return text.slice(0, 5000);
}

function normalizeStoreTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPlayStationIntro(title) {
  const query = encodeURIComponent(title);
  const searchUrl = `https://store.playstation.com/store/api/chihiro/00_09_000/tumbler/US/en/19/${query}?size=8&suggested_size=0`;
  const { data: searchData } = await axios.get(searchUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 15000,
  });

  const items = Array.isArray(searchData?.links) ? searchData.links : [];
  const normalizedTitle = normalizeStoreTitle(title);
  const selected =
    items.find((item) => normalizeStoreTitle(item.title_name || item.name).includes(normalizedTitle)) ||
    items.find((item) => item?.id && item?.container_type === "product") ||
    items.find((item) => item?.id);

  if (!selected?.id) throw new Error("PlayStation product not found");

  const detailUrl = `https://store.playstation.com/store/api/chihiro/00_09_000/container/US/en/19/${encodeURIComponent(selected.id)}`;
  const { data: detail } = await axios.get(detailUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 15000,
  });

  const intro = cleanStoreIntro(detail?.long_desc || detail?.short_desc || "");
  if (!intro) throw new Error("PlayStation intro not found");

  return {
    intro: `Buy ${detail?.title_name || detail?.name || selected.name || title} on PlayStation Store. ${intro}`,
    score: detail?.star_rating?.score ? Number(detail.star_rating.score) : null,
    sourceTitle: detail?.name || selected.name || "",
  };
}

async function fetchXboxIntro(title) {
  const query = encodeURIComponent(title);
  const suggestUrl = `https://displaycatalog.mp.microsoft.com/v7.0/productFamilies/autosuggest?market=US&languages=en-US&query=${query}&productFamilyNames=Games&top=8`;
  const { data: suggestData } = await axios.get(suggestUrl, { timeout: 15000 });
  const products = (suggestData?.Results || []).flatMap((group) => group?.Products || []);
  const normalizedTitle = normalizeStoreTitle(title);
  const selected =
    products.find((item) => normalizeStoreTitle(item.Title).includes(normalizedTitle)) ||
    products[0];

  if (!selected?.ProductId) throw new Error("Xbox product not found");

  const detailUrl = `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${encodeURIComponent(selected.ProductId)}&market=US&languages=en-US&MS-CV=DGU1mcuYo0WMMp`;
  const { data: detailData } = await axios.get(detailUrl, { timeout: 15000 });
  const product = detailData?.Products?.[0];
  const localized = product?.LocalizedProperties?.[0] || {};
  const intro = cleanStoreIntro(localized.ProductDescription || localized.ShortDescription || "");
  if (!intro) throw new Error("Xbox intro not found");

  const allTimeRating = (product?.MarketProperties?.[0]?.UsageData || []).find(
    (item) => item?.AggregateTimeSpan === "AllTime"
  );

  return {
    intro,
    score: allTimeRating?.AverageRating ? Number(allTimeRating.AverageRating) : null,
    sourceTitle: localized.ProductTitle || selected.Title || "",
  };
}

function normalizeScore100(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeScore5To100(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, Math.round(score * 20)));
}

async function fetchSteamScores(title) {
  const { data: searchData } = await axios.get("https://store.steampowered.com/api/storesearch/", {
    params: { cc: "us", l: "en", term: title },
    timeout: 15000,
  });

  const items = Array.isArray(searchData?.items) ? searchData.items : [];
  const normalizedTitle = normalizeStoreTitle(title);
  const selected =
    items.find((item) => normalizeStoreTitle(item.name) === normalizedTitle) ||
    items.find((item) => normalizeStoreTitle(item.name).includes(normalizedTitle)) ||
    items[0];

  if (!selected?.id) throw new Error("Steam product not found");

  const appid = selected.id;
  const [{ data: detailData }, { data: reviewData }] = await Promise.all([
    axios.get("https://store.steampowered.com/api/appdetails", {
      params: { appids: appid, cc: "us", l: "en" },
      timeout: 15000,
    }),
    axios.get(`https://store.steampowered.com/appreviews/${appid}`, {
      params: { json: 1, language: "all", num_per_page: 0, purchase_type: "all" },
      timeout: 15000,
    }),
  ]);

  const detail = detailData?.[appid]?.data || {};
  const reviewSummary = reviewData?.query_summary || {};
  const totalPositive = Number(reviewSummary.total_positive || 0);
  const totalReviews = Number(reviewSummary.total_reviews || 0);
  const steamScore = totalReviews > 0 ? Math.round((totalPositive / totalReviews) * 100) : null;
  const metacriticScore = normalizeScore100(detail?.metacritic?.score || selected?.metascore);

  return {
    appid,
    metacriticScore,
    sourceTitle: detail.name || selected.name || "",
    steamScore,
  };
}

async function fetchXboxScores(title) {
  const data = await fetchXboxIntro(title);
  return {
    sourceTitle: data.sourceTitle,
    xboxScore: normalizeScore5To100(data.score),
  };
}

async function fetchPlayStationScores(title) {
  const data = await fetchPlayStationIntro(title);
  return {
    sourceTitle: data.sourceTitle,
    sonyScore: normalizeScore5To100(data.score),
  };
}

async function fetchAllStoreScores(title) {
  const [steamResult, xboxResult, playStationResult] = await Promise.allSettled([
    fetchSteamScores(title),
    fetchXboxScores(title),
    fetchPlayStationScores(title),
  ]);

  const steamData = steamResult.status === "fulfilled" ? steamResult.value : {};
  const xboxData = xboxResult.status === "fulfilled" ? xboxResult.value : {};
  const playStationData = playStationResult.status === "fulfilled" ? playStationResult.value : {};

  return {
    metacriticScore: steamData.metacriticScore ?? null,
    sourceTitle: steamData.sourceTitle || xboxData.sourceTitle || playStationData.sourceTitle || "",
    sonyScore: playStationData.sonyScore ?? null,
    steamScore: steamData.steamScore ?? null,
    xboxScore: xboxData.xboxScore ?? null,
  };
}

async function makeUniqueSlug(title, currentId = null) {
  const baseSlug = makeSlug(title);
  if (!baseSlug) return "";

  let slug = baseSlug;
  let counter = 2;

  while (
    await Game.exists({
      slug,
      isDeleted: false,
      ...(currentId ? { _id: { $ne: currentId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

function parseArray(value) {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    }
  } catch (_) {}

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const offlinePlayerCatalog = [
  {
    key: "single-player",
    title_fa: "تک‌نفره",
    title_en: "Single-player",
    min: 1,
    max: 1,
    legacyValues: ["offline_1", "single_player", "تک نفره", "تک‌نفره", "1"],
  },
  {
    key: "up-to-4",
    title_fa: "تا ۴ نفر",
    title_en: "Up to 4 players",
    min: 1,
    max: 4,
    legacyValues: ["offline_1_4", "1-4 نفره", "تا 4 نفر", "تا ۴ نفر", "up_to_4"],
  },
];

const normalizedOfflinePlayerCatalog = [
  {
    key: "none",
    title_fa: "ندارد",
    title_en: "No offline players",
    min: 0,
    max: 0,
    legacyValues: ["no", "none", "0", "ندارد"],
  },
  {
    key: "single-player",
    title_fa: "تک‌نفره",
    title_en: "Single-player",
    min: 1,
    max: 1,
    legacyValues: ["offline_1", "single_player", "تک نفره", "تک‌نفره", "1"],
  },
  {
    key: "1-2",
    title_fa: "۱-۲ نفره",
    title_en: "1-2 players",
    min: 1,
    max: 2,
    legacyValues: ["1-2 نفره", "1 تا 2 نفر", "۱-۲ نفره", "۱ تا ۲ نفر"],
  },
  {
    key: "3-4",
    title_fa: "۳-۴ نفره",
    title_en: "3-4 players",
    min: 3,
    max: 4,
    legacyValues: ["offline_1_4", "1-4 نفره", "تا 4 نفر", "تا ۴ نفر", "up_to_4", "up-to-4", "3-4 نفره", "۳-۴ نفره"],
  },
];

const offlinePlayerCatalogMap = new Map(
  normalizedOfflinePlayerCatalog.flatMap((item) =>
    [item.key, item.title_fa, item.title_en, ...(item.legacyValues || [])].map((value) => [String(value).trim(), item])
  )
);

function parseOfflinePlayerItem(value) {
  if (!value) return null;

  if (typeof value === "object") {
    const key = String(value.key || value.value || "").trim();
    const catalogItem = offlinePlayerCatalogMap.get(key);
    return {
      key: catalogItem?.key || key || "",
      title_fa: String(catalogItem?.title_fa || value.title_fa || value.titleFa || value.label_fa || value.label || "").trim(),
      title_en: String(catalogItem?.title_en || value.title_en || value.titleEn || value.label_en || "").trim(),
      min: toNumber(value.min ?? catalogItem?.min),
      max: toNumber(value.max ?? catalogItem?.max),
    };
  }

  const text = String(value || "").trim();
  const catalogItem = offlinePlayerCatalogMap.get(text);
  if (catalogItem) {
    const { legacyValues, ...item } = catalogItem;
    return item;
  }

  return {
    key: makeSlug(text),
    title_fa: text,
    title_en: "",
    min: null,
    max: null,
  };
}

function parseOfflinePlayers(value) {
  if (value === undefined || value === null || value === "") return [];

  let items = value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      items = Array.isArray(parsed) ? parsed : [parsed];
    } catch (_) {
      items = value.split(",");
    }
  }

  if (!Array.isArray(items)) items = [items];

  return items.map(parseOfflinePlayerItem).filter((item) => item?.key || item?.title_fa || item?.title_en);
}

function parseSocialLinks(value) {
  if (value === undefined || value === null || value === "") return [];
  const rawItems = Array.isArray(value) ? value : (() => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  })();

  return rawItems
    .map((item) => ({
      platform: String(item?.platform || "").trim(),
      label: String(item?.label || "").trim(),
      url: String(item?.url || "").trim(),
    }))
    .filter((item) => item.platform && item.url);
}

function parseObjectArray(value, shape) {
  if (value === undefined || value === null || value === "") return [];
  const rawItems = Array.isArray(value)
    ? value
    : (() => {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
          return [];
        }
      })();

  return rawItems
    .map((item) => shape(item))
    .filter((item) => Object.values(item).some((part) => String(part || "").trim()));
}

function parseSearchTitles(value) {
  return parseObjectArray(value, (item) => {
    const title = String(item?.title || item?.name || "").trim();
    return {
      title,
      slug: makeSlug(item?.slug || title),
    };
  }).filter((item) => item.title);
}

function parseFilterValues(value) {
  if (value === undefined || value === null || value === "") return undefined;
  let raw = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch (_) {
      raw = {};
    }
  }

  const numberOrNull = (item) => {
    if (item === undefined || item === null || item === "") return null;
    const number = Number(item);
    return Number.isFinite(number) ? number : null;
  };

  return {
    priceMin: numberOrNull(raw.priceMin),
    priceMax: numberOrNull(raw.priceMax),
    sizeMinGb: numberOrNull(raw.sizeMinGb),
    sizeMaxGb: numberOrNull(raw.sizeMaxGb),
    ageRatings: parseArray(raw.ageRatings),
    genres: parseArray(raw.genres),
    gameModes: parseArray(raw.gameModes),
    offlinePlayers: parseOfflinePlayers(raw.offlinePlayers).map((item) => item.key).filter(Boolean),
  };
}

function parseDateValue(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeStructuredImages(items, uploadedFiles, fieldName) {
  if (!Array.isArray(items)) return [];
  const files = Array.isArray(uploadedFiles?.[fieldName]) ? uploadedFiles[fieldName] : [];
  let fileIndex = 0;

  return items.map((item) => {
    const image = parseMediaValue(item.image, "image");
    if (!image && fileIndex < files.length) {
      const image = buildMedia(files[fileIndex]);
      fileIndex += 1;
      return { ...item, image };
    }

    return image ? { ...item, image } : { ...item, image: undefined };
  });
}

function parseBoolean(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function buildMedia(file) {
  if (!file) return undefined;

  return {
    url: file.url,
    public_id: file.public_id,
    type: file.resource_type === "video" ? "video" : "image",
  };
}

function parseMediaValue(value, fallbackType = "image") {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === "__delete__") return null;

  const raw =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value);
          } catch (_) {
            return { url: value };
          }
        })()
      : value;

  if (!raw?.url) return undefined;

  return {
    url: String(raw.url || "").trim(),
    public_id: String(raw.public_id || raw.key || "").trim(),
    type: raw.type === "video" || raw.resource_type === "video" ? "video" : fallbackType,
  };
}

function normalizeGalleryItems(value, uploadedFiles, currentGame = null) {
  const files = Array.isArray(uploadedFiles?.gallery) ? uploadedFiles.gallery : [];

  if (value === undefined) {
    if (!files.length) return undefined;
    return [
      ...(currentGame?.gallery || []),
      ...files.map(buildMedia).filter(Boolean),
    ];
  }

  let items = [];
  try {
    items = typeof value === "string" ? JSON.parse(value) : value;
  } catch (_) {
    items = [];
  }

  if (!Array.isArray(items)) return [];

  let fileIndex = 0;
  return items
    .map((item) => {
      if (item?.kind === "new") {
        const media = buildMedia(files[fileIndex]);
        fileIndex += 1;
        return media;
      }

      return parseMediaValue(item?.media || item, "image");
    })
    .filter(Boolean);
}

function limitText(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? text.slice(0, maxLength).trim() : text;
}

function applySeoFromContent(payload, currentGame = null) {
  const title =
    payload.title !== undefined ? payload.title : currentGame?.title || "";
  const shortDescription =
    payload.shortDescription !== undefined
      ? payload.shortDescription
      : currentGame?.shortDescription || "";
  const summary =
    payload.summary !== undefined
      ? payload.summary
      : currentGame?.summary || "";

  if (payload.title !== undefined || payload.summary !== undefined || payload.shortDescription !== undefined || !currentGame) {
    payload.seoTitle = limitText(title, 160);
    payload.seoDescription = limitText(summary || shortDescription || title, 320);
    payload.seoKeywords = [title, summary || shortDescription]
      .filter(Boolean)
      .map((item) => limitText(item, 80));
  }
}

async function ensureExists(Model, ids, label) {
  const values = Array.isArray(ids) ? ids : ids ? [ids] : [];
  const filtered = values.filter(Boolean);

  for (const id of filtered) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`${label} id is not valid`);
    }
  }

  if (!filtered.length) return;

  const count = await Model.countDocuments({
    _id: { $in: filtered },
    isDeleted: false,
  });

  if (count !== filtered.length) {
    throw new Error(`${label} not found`);
  }
}

function normalizePayload(body, uploadedFiles, currentGame) {
  const title = body.title !== undefined ? String(body.title).trim() : undefined;
  const slug = body.slug !== undefined ? String(body.slug).trim() : undefined;
  const payload = {
    title,
    summary:
      body.summary !== undefined
        ? limitText(body.summary, 160)
        : undefined,
    slug: slug !== undefined ? slug : title !== undefined ? "" : undefined,
    shortDescription:
      body.shortDescription !== undefined
        ? String(body.shortDescription).trim()
        : undefined,
    description:
      body.description !== undefined ? String(body.description).trim() : undefined,
    reviewSiteTitle:
      body.reviewSiteTitle !== undefined ? String(body.reviewSiteTitle).trim() : undefined,
    reviewSource:
      body.reviewSource !== undefined ? String(body.reviewSource).trim() : undefined,
    reviewLink:
      body.reviewLink !== undefined ? String(body.reviewLink).trim() : undefined,
    reviewItems:
      body.reviewItems !== undefined
        ? parseObjectArray(body.reviewItems, (item) => ({
            title: String(item?.title || "").trim(),
            link: String(item?.link || "").trim(),
          }))
        : undefined,
    category: body.category !== undefined ? body.category || null : undefined,
    genres: body.genres !== undefined ? parseArray(body.genres) : undefined,
    showGenresInCategories:
      body.showGenresInCategories !== undefined ? parseBoolean(body.showGenresInCategories) : undefined,
    developers:
      body.developers !== undefined ? parseArray(body.developers) : undefined,
    publishers:
      body.publishers !== undefined ? parseArray(body.publishers) : undefined,
    tags: body.tags !== undefined ? parseArray(body.tags) : undefined,
    gameKeywords:
      body.gameKeywords !== undefined ? parseArray(body.gameKeywords) : undefined,
    filterDefinitions:
      body.filterDefinitions !== undefined ? parseArray(body.filterDefinitions) : undefined,
    searchTitles:
      body.searchTitles !== undefined ? parseSearchTitles(body.searchTitles) : undefined,
    filterValues:
      body.filterValues !== undefined ? parseFilterValues(body.filterValues) : undefined,
    collections: body.collections !== undefined ? parseArray(body.collections) : undefined,
    platforms:
      body.platforms !== undefined ? parseArray(body.platforms) : undefined,
    gameModes:
      body.gameModes !== undefined ? parseArray(body.gameModes) : undefined,
    offlinePlayers:
      body.offlinePlayers !== undefined ? parseOfflinePlayers(body.offlinePlayers) : undefined,
    onlinePlayers:
      body.onlinePlayers !== undefined ? parseArray(body.onlinePlayers) : undefined,
    onlinePlayerCount:
      body.onlinePlayerCount !== undefined ? String(body.onlinePlayerCount).trim() : undefined,
    multiplayerPlayerCount:
      body.multiplayerPlayerCount !== undefined ? String(body.multiplayerPlayerCount).trim() : undefined,
    relatedGames:
      body.relatedGames !== undefined ? parseArray(body.relatedGames) : undefined,
    launcher: body.launcher !== undefined ? parseArray(body.launcher) : undefined,
    edition: body.edition !== undefined ? String(body.edition).trim() : undefined,
    hasDubbing: body.hasDubbing !== undefined ? parseBoolean(body.hasDubbing) : undefined,
    hasSubtitle: body.hasSubtitle !== undefined ? parseBoolean(body.hasSubtitle) : undefined,
    hasFreePersianSubtitle:
      body.hasFreePersianSubtitle !== undefined ? parseBoolean(body.hasFreePersianSubtitle) : undefined,
    hasPaidPersianSubtitle:
      body.hasPaidPersianSubtitle !== undefined ? parseBoolean(body.hasPaidPersianSubtitle) : undefined,
    dlcs:
      body.dlcs !== undefined
        ? parseObjectArray(body.dlcs, (item) => ({
            title: typeof item === "string" ? String(item).trim() : String(item?.title || "").trim(),
            type: typeof item === "string" ? "" : String(item?.type || "").trim(),
            versionSize: typeof item === "string" ? "" : String(item?.versionSize || "").trim(),
            image: typeof item === "string" ? "" : item?.image || "",
          }))
        : undefined,
    extraEditions:
      body.extraEditions !== undefined
        ? parseObjectArray(body.extraEditions, (item) => ({
            title: typeof item === "string" ? String(item).trim() : String(item?.title || "").trim(),
            versionSize: typeof item === "string" ? "" : String(item?.versionSize || "").trim(),
            price: typeof item === "string" ? null : toNumber(item?.price),
            image: typeof item === "string" ? "" : item?.image || "",
          }))
        : undefined,
    platformSizes:
      body.platformSizes !== undefined
        ? parseObjectArray(body.platformSizes, (item) => ({
            platform: String(item?.platform || "").trim() || null,
            variant: String(item?.variant || "").trim(),
            size: String(item?.size || "").trim(),
          }))
        : undefined,
    platformReleases:
      body.platformReleases !== undefined
        ? parseObjectArray(body.platformReleases, (item) => ({
            platform: String(item?.platform || "").trim() || null,
            releaseDate: parseDateValue(item?.releaseDate),
          }))
        : undefined,
    releaseDate:
      body.releaseDate !== undefined
        ? body.releaseDate
          ? new Date(body.releaseDate)
          : null
        : undefined,
    officialWebsite:
      body.officialWebsite !== undefined
        ? String(body.officialWebsite).trim()
        : undefined,
    socialLinks:
      body.socialLinks !== undefined ? parseSocialLinks(body.socialLinks) : undefined,
    ageRating:
      body.ageRating !== undefined ? parseAgeRating(body.ageRating) : undefined,
    gameplayTime:
      body.gameplayTime !== undefined ? String(body.gameplayTime).trim() : undefined,
    reviewSiteTitle:
      body.reviewSiteTitle !== undefined ? String(body.reviewSiteTitle).trim() : undefined,
    reviewSource:
      body.reviewSource !== undefined ? String(body.reviewSource).trim() : undefined,
    reviewLink:
      body.reviewLink !== undefined ? String(body.reviewLink).trim() : undefined,
    metacriticScore:
      body.metacriticScore !== undefined ? toNumber(body.metacriticScore) : undefined,
    sonyScore:
      body.sonyScore !== undefined ? toNumber(body.sonyScore) : undefined,
    steamScore:
      body.steamScore !== undefined ? toNumber(body.steamScore) : undefined,
    xboxScore:
      body.xboxScore !== undefined ? toNumber(body.xboxScore) : undefined,
    isFeatured:
      body.isFeatured !== undefined ? parseBoolean(body.isFeatured) : undefined,
  };

  const cover = buildMedia(uploadedFiles?.cover?.[0]);
  if (cover) payload.cover = cover;
  else if (body.cover !== undefined) payload.cover = parseMediaValue(body.cover, "image");
  else if (body.cardDesktopCover !== undefined) payload.cover = parseMediaValue(body.cardDesktopCover, "image");

  const desktopCover = buildMedia(uploadedFiles?.desktopCover?.[0]);
  if (desktopCover) payload.desktopCover = desktopCover;
  else if (body.desktopCover !== undefined) payload.desktopCover = parseMediaValue(body.desktopCover, "image");

  const mobileCover = buildMedia(uploadedFiles?.mobileCover?.[0]);
  if (mobileCover) payload.mobileCover = mobileCover;
  else if (body.mobileCover !== undefined) payload.mobileCover = parseMediaValue(body.mobileCover, "image");
  else if (body.cardMobileCover !== undefined) payload.mobileCover = parseMediaValue(body.cardMobileCover, "image");

  const gallery = normalizeGalleryItems(body.galleryItems, uploadedFiles, currentGame);
  if (gallery !== undefined) payload.gallery = gallery;

  const trailerVideo = buildMedia(uploadedFiles?.trailerVideo?.[0]);
  if (trailerVideo) payload.trailerVideo = trailerVideo;
  else if (body.trailerVideo !== undefined) payload.trailerVideo = parseMediaValue(body.trailerVideo, "video");

  const trailerThumbnail = buildMedia(uploadedFiles?.trailerThumbnail?.[0]);
  if (trailerThumbnail) payload.trailerThumbnail = trailerThumbnail;
  else if (body.trailerThumbnail !== undefined) payload.trailerThumbnail = parseMediaValue(body.trailerThumbnail, "image");

  const patchImage = buildMedia(uploadedFiles?.patchImage?.[0]);
  if (patchImage) payload.patchImage = patchImage;
  else if (body.patchImage !== undefined) payload.patchImage = parseMediaValue(body.patchImage, "image");

  if (payload.dlcs !== undefined) {
    payload.dlcs = normalizeStructuredImages(payload.dlcs, uploadedFiles, "dlcImages");
  }

  if (payload.extraEditions !== undefined) {
    payload.extraEditions = normalizeStructuredImages(payload.extraEditions, uploadedFiles, "extraEditionImages");
  }

  applySeoFromContent(payload, currentGame);
  if (!currentGame) payload.status = "pending";

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

async function validatePayload(payload) {
  if (payload.category !== undefined) {
    if (!payload.category) throw new Error("Game category is required");
    await ensureExists(Category, payload.category, "Category");
  }
  if (payload.genres !== undefined) await ensureExists(Genre, payload.genres, "Genre");
  if (payload.platforms !== undefined) await ensureExists(Platform, payload.platforms, "Platform");
  if (payload.platformReleases !== undefined) {
    await ensureExists(
      Platform,
      payload.platformReleases.map((item) => item.platform).filter(Boolean),
      "Platform"
    );
  }
  if (payload.platformSizes !== undefined) {
    await ensureExists(
      Platform,
      payload.platformSizes.map((item) => item.platform).filter(Boolean),
      "Platform"
    );
  }
  if (payload.developers !== undefined) {
    await ensureExists(Company, payload.developers, "Developer");
  }
  if (payload.publishers !== undefined) {
    await ensureExists(Company, payload.publishers, "Publisher");
  }
  if (payload.tags !== undefined) await ensureExists(Tag, payload.tags, "Tag");
  if (payload.gameKeywords !== undefined) await ensureExists(GameKeyword, payload.gameKeywords, "GameKeyword");
  if (payload.filterDefinitions !== undefined) await ensureExists(FilterDefinition, payload.filterDefinitions, "FilterDefinition");
  if (payload.filterValues?.genres !== undefined) await ensureExists(Genre, payload.filterValues.genres, "Filter value genre");
  if (payload.collections !== undefined) await ensureExists(GameCollection, payload.collections, "GameCollection");
  if (payload.relatedGames !== undefined) await ensureExists(Game, payload.relatedGames, "Related game");
}

async function syncGameCollections(gameId, previousCollections = [], nextCollections = []) {
  const previousIds = previousCollections.map((item) => String(item?._id || item)).filter(Boolean);
  const nextIds = nextCollections.map((item) => String(item?._id || item)).filter(Boolean);
  const removed = previousIds.filter((id) => !nextIds.includes(id));

  if (removed.length) {
    await GameCollection.updateMany(
      { _id: { $in: removed } },
      { $pull: { games: { game: gameId } } }
    );
  }

  for (const [index, collectionId] of nextIds.entries()) {
    await GameCollection.updateOne(
      { _id: collectionId, "games.game": { $ne: gameId } },
      { $push: { games: { game: gameId, sortOrder: index, visible: true } } }
    );
  }
}

exports.translateSearchTitleSlug = async (req, res) => {
  const title = String(req.body?.title || "").trim();

  if (!title) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "عنوان برای ترجمه الزامی است",
    });
  }

  const slug = await translateTitleToEnglishSlug(title);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    data: { slug },
  });
};

exports.translateIntro = async (req, res) => {
  const text = String(req.body?.text || "").trim();
  const title = String(req.body?.title || "").trim();
  const source = String(req.body?.source || "").trim().toLowerCase();

  if (!text && !title) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "عنوان بازی یا متن معرفی برای ترجمه الزامی است",
    });
  }

  try {
    let storeData = null;
    let sourceText = text;

    if (!sourceText) {
      if (source === "playstation") {
        storeData = await fetchPlayStationIntro(title);
      } else if (source === "xbox") {
        storeData = await fetchXboxIntro(title);
      } else {
        throw new Error("Unknown source");
      }
      sourceText = storeData.intro;
    }

    const translatedText = await translateIntroToPersian(sourceText);
    if (!translatedText) throw new Error("Empty translation");

    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "متن معرفی ترجمه شد",
      data: {
        score: storeData?.score ?? null,
        source,
        sourceText,
        sourceTitle: storeData?.sourceTitle || "",
        text: translatedText,
      },
    });
  } catch (error) {
    res.status(502).json({
      acknowledgement: false,
      message: "Translation Failed",
      description:
        source === "playstation"
          ? "دریافت معرفی از PlayStation انجام نشد"
          : source === "xbox"
            ? "دریافت معرفی از Xbox انجام نشد"
            : "ترجمه معرفی انجام نشد؛ اتصال یا سرویس ترجمه را بررسی کنید",
    });
  }
};

exports.importScores = async (req, res) => {
  const title = String(req.body?.title || "").trim();
  const source = String(req.body?.source || "").trim().toLowerCase();

  if (!title) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "عنوان بازی برای دریافت امتیاز الزامی است",
    });
  }

  try {
    const data =
      source === "steam"
        ? await fetchSteamScores(title)
        : source === "xbox"
          ? await fetchXboxScores(title)
          : source === "playstation" || source === "sony"
            ? await fetchPlayStationScores(title)
            : source === "all" || !source
              ? await fetchAllStoreScores(title)
              : null;

    if (!data) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Bad Request",
        description: "منبع امتیاز معتبر نیست",
      });
    }

    const foundScores = Object.entries(data).filter(([key, value]) => key.endsWith("Score") && value !== null && value !== undefined);
    if (!foundScores.length) throw new Error("No scores found");

    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "امتیازها دریافت شد",
      data,
    });
  } catch (error) {
    res.status(502).json({
      acknowledgement: false,
      message: "Scores Import Failed",
      description:
        source === "steam"
          ? "دریافت امتیاز از Steam انجام نشد"
          : source === "xbox"
            ? "دریافت امتیاز از Xbox انجام نشد"
            : "دریافت امتیاز انجام نشد",
    });
  }
};

exports.createGame = async (req, res) => {
  const payload = normalizePayload(req.body, req.uploadedFiles);
  payload.creator = req.admin?._id || null;
  console.log("[games:create] body:", req.body);
  console.log("[games:create] files:", Object.keys(req.uploadedFiles || {}));
  console.log("[games:create] payload:", payload);

  if (!payload.title) {
    console.log("[games:create] missing title");
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "عنوان بازی الزامی است",
    });
  }

  payload.slug = await makeUniqueSlug(payload.slug || payload.title);

  await validatePayload(payload);

  const game = await Game.create(payload);
  if (payload.collections !== undefined) {
    await syncGameCollections(game._id, [], payload.collections);
  }
  const populatedGame = await populateGame(Game.findById(game._id));

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "بازی با موفقیت ایجاد شد",
    data: populatedGame,
  });
};





exports.getGames = async (req, res) => {
  const search = getSearchTerm(req.query);
  const category = String(req.query.category || "").trim();
  if (category && !mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه دسته‌بندی بازی معتبر نیست",
    });
  }
  const query = {
    isDeleted: false,
    ...(req.adminRecord ? {} : { status: "active" }),
    ...(category ? { category } : {}),
    ...buildSearchQuery(search, [
      "title",
      "slug",
      "shortDescription",
      "description",
      "seoTitle",
      "seoDescription",
      "seoKeywords",
      "searchTitles.title",
    ]),
  };
  const { limit, page, skip } = getPaginationOptions(req.query);
  const [games, totalItems] = await Promise.all([
    populateGame(Game.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Game.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست بازی‌ها دریافت شد",
    data: games,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getGame = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه بازی معتبر نیست",
    });
  }

  const game = await populateGame(
    Game.findOne({
      _id: id,
      isDeleted: false,
      ...(req.adminRecord ? {} : { status: "active" }),
    })
  );

  if (!game) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "بازی یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "جزئیات بازی دریافت شد",
    data: game,
  });
};

exports.updateGame = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه بازی معتبر نیست",
    });
  }

  const game = await Game.findOne({ _id: id, isDeleted: false });
  if (!game) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "بازی یافت نشد",
    });
  }

  const payload = normalizePayload(req.body, req.uploadedFiles, game);
  const previousCollections = game.collections || [];
  if (payload.title !== undefined || payload.slug !== undefined) {
    payload.slug = await makeUniqueSlug(payload.slug || payload.title || game.title, id);
  }
  await validatePayload(payload);
  Object.assign(game, payload);
  await game.save();
  if (payload.collections !== undefined) {
    await syncGameCollections(game._id, previousCollections, payload.collections);
  }

  const populatedGame = await populateGame(Game.findById(game._id));

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "بازی با موفقیت به‌روزرسانی شد",
    data: populatedGame,
  });
};

exports.deleteGame = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه بازی معتبر نیست",
    });
  }

  const game = await Game.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!game) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "بازی یافت نشد",
    });
  }
  await GameCollection.updateMany(
    { "games.game": id },
    { $pull: { games: { game: id } } }
  );

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "بازی با موفقیت حذف شد",
  });
};
