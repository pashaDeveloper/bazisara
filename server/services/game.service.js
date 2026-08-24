const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const translate = require("google-translate-api-x");
const {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  getTitleTrophies,
  getUserTitles,
} = require("psn-api");
const Game = require("../models/game.model");
const Category = require("../models/category.model");
const Genre = require("../models/genre.model");
const Platform = require("../models/platform.model");
const Company = require("../models/company.model");
const Tag = require("../models/tag.model");
const GameCollection = require("../models/gameCollection.model");
const GameKeyword = require("../models/gameKeyword.model");
const {
  buildSearchQuery,
  buildPaginationMeta,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");
const { buildGameDynamicTagNames, buildGameSeoPayload } = require("../utils/gameSeo.util");
const { publicIdOrLegacyFilters } = require("../utils/publicId.util");

let playStation3TitleDbPromise = null;

function makeServiceError(message, statusCode = 502, code = "") {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

function getUpstreamStatus(error) {
  return Number(error?.response?.status || error?.statusCode || error?.status || 0);
}

function mapXboxError(error) {
  const status = getUpstreamStatus(error);
  const code = String(error?.code || "");

  if (error?.statusCode) return error;
  if (status === 401 || status === 403) {
    return makeServiceError("Xbox Live authorization is invalid or expired", 424, "XBOX_AUTH_EXPIRED");
  }
  if (status === 404) {
    return makeServiceError("Xbox achievements were not found for this title", 404, "XBOX_ACHIEVEMENTS_NOT_FOUND");
  }
  if (code === "ECONNABORTED" || code === "ETIMEDOUT") {
    return makeServiceError("Xbox Live request timed out", 504, "XBOX_TIMEOUT");
  }

  return makeServiceError(error?.message || "Xbox Live request failed", 502, "XBOX_UPSTREAM_FAILED");
}

function isXboxAuthError(error) {
  const status = getUpstreamStatus(error);
  return status === 401 || status === 403 || error?.code === "XBOX_AUTH_EXPIRED";
}

function mapPlayStationError(error) {
  const status = getUpstreamStatus(error);
  const code = String(error?.code || "");

  if (error?.statusCode) return error;
  if (status === 401 || status === 403) {
    return makeServiceError("PlayStation NPSSO is invalid or expired", 424, "PSN_AUTH_EXPIRED");
  }
  if (status === 404) {
    return makeServiceError("PlayStation trophies were not found for this title", 404, "PSN_TROPHIES_NOT_FOUND");
  }
  if (code === "ECONNABORTED" || code === "ETIMEDOUT") {
    return makeServiceError("PlayStation request timed out", 504, "PSN_TIMEOUT");
  }

  return makeServiceError(error?.message || "PlayStation request failed", 502, "PSN_UPSTREAM_FAILED");
}

function getXboxAchievementErrorDescription(error) {
  if (error?.code === "XBOX_AUTH_NOT_CONFIGURED") return "توکن Xbox Live روی سرور تنظیم نشده است";
  if (error?.code === "XBOX_AUTH_EXPIRED") return "توکن Xbox Live منقضی یا نامعتبر است؛ باید توکن جدید بگیرید";
  if (error?.code === "XBOX_PRODUCT_NOT_FOUND") return "این عنوان در کاتالوگ Xbox پیدا نشد";
  if (error?.code === "XBOX_TITLE_ID_NOT_FOUND") return "Title ID ایکس‌باکس برای این بازی پیدا نشد؛ اگر این بازی با اکانت Xbox تنظیم‌شده اجرا نشده، titleId را دستی بفرستید";
  if (error?.code === "XBOX_ACHIEVEMENTS_NOT_FOUND") return "برای این عنوان اچیومنت Xbox پیدا نشد";
  if (error?.code === "XBOX_TIMEOUT") return "درخواست Xbox Live بیش از حد طول کشید؛ دوباره تلاش کنید";
  return "دریافت تروفی‌های Xbox انجام نشد";
}

function getPlayStationTrophyErrorDescription(error) {
  if (error?.code === "PSN_AUTH_NOT_CONFIGURED") return "توکن NPSSO پلی‌استیشن روی سرور تنظیم نشده است";
  if (error?.code === "PSN_AUTH_EXPIRED") return "توکن NPSSO پلی‌استیشن منقضی یا نامعتبر است؛ باید NPSSO جدید بگیرید";
  if (error?.code === "PSN_TITLE_NOT_FOUND") return "این بازی در لیست تروفی‌های اکانت PlayStation پیدا نشد؛ NP Communication ID را دستی وارد کنید";
  if (error?.code === "PSN_TROPHIES_NOT_FOUND") return "برای این NP Communication ID تروفی پیدا نشد";
  if (error?.code === "PSN_TIMEOUT") return "درخواست PlayStation بیش از حد طول کشید؛ دوباره تلاش کنید";
  return "دریافت تروفی‌های PlayStation انجام نشد";
}

const populateGame = (query) =>
  query
    .populate("category", "name")
    .populate("genres", "name icon image")
    .populate("platforms", "name name_fa name_en slug parent image fontFile svgIcon")
    .populate("platformReleases.platform", "name name_fa name_en slug parent image fontFile svgIcon")
    .populate("platformSizes.platform", "name slug parent image fontFile svgIcon")
    .populate("platformDownloadLinks.platform", "name name_fa name_en slug parent image fontFile svgIcon")
    .populate("extraEditions.items.platform", "name name_fa name_en slug parent image fontFile svgIcon")
    .populate("developers", "name logo icon")
    .populate("publishers", "name logo icon")
    .populate("tags", "name slug image")
    .populate("gameKeywords", "name title_en slug image")
    .populate("filterValues.genres", "name icon image")
    .populate("collections", "title_fa title_en slug placement visibility")
    .populate("relatedGames", "gameId playstationTitleId title slug cover")
    .populate("creator", "name email avatar role adminId");

function gameIdentityFilter(id) {
  const value = String(id || "").trim();
  const filters = [];
  filters.push(...publicIdOrLegacyFilters("gameId", value, "GM"));
  if (value) {
    if (/^bb-\d+$/i.test(value)) filters.push({ gameId: value.toLowerCase() });
    filters.push({ gameId: value.toUpperCase() });
    filters.push({ playstationTitleId: value.toUpperCase() });
  }
  if (mongoose.Types.ObjectId.isValid(value)) filters.push({ _id: value });
  if (filters.length > 1) return { $or: filters };
  if (filters.length === 1) return filters[0];
  return null;
}

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

function uniqueObjectIds(values) {
  const seen = new Set();
  return (Array.isArray(values) ? values : [])
    .map((value) => String(value?._id || value || "").trim())
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

async function ensureDynamicGameTags(title, creator = null) {
  const names = buildGameDynamicTagNames(title);
  const tagIds = [];

  for (const name of names) {
    const slug = makeSlug(name);
    if (!slug) continue;

    const tag = await Tag.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          creator,
          description: name,
          name,
          seoDescription: name,
          seoKeywords: [name],
          seoTitle: name,
          slug,
        },
      },
      { new: true, upsert: true }
    ).select("_id");

    tagIds.push(String(tag._id));
  }

  return tagIds;
}

async function applyDynamicGameTags(payload, currentGame = null, creator = null) {
  const title = String(payload.title !== undefined ? payload.title : currentGame?.title || "").trim();
  if (!title) return;

  const dynamicTagIds = await ensureDynamicGameTags(title, creator);
  payload.tags = uniqueObjectIds([
    ...(payload.tags !== undefined ? payload.tags : currentGame?.tags || []),
    ...dynamicTagIds,
  ]);
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

function normalizeReleaseDateValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function makePlatformRelease(platformKey, releaseDate, platformName = "") {
  const date = normalizeReleaseDateValue(releaseDate);
  if (!date) return null;

  return {
    platformKey,
    platformName: platformName || platformKey,
    releaseDate: date,
  };
}

function mergePlatformReleaseData(...groups) {
  const seen = new Set();
  const releases = [];

  groups.flat().forEach((item) => {
    if (!item?.releaseDate || !item?.platformKey) return;
    const key = `${String(item.platformKey).toLowerCase()}:${item.releaseDate}`;
    if (seen.has(key)) return;
    seen.add(key);
    releases.push(item);
  });

  return releases;
}

function normalizePsxHubVersion(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const number = Number(raw);
  if (!Number.isFinite(number)) return raw;
  if (number >= 1000000) {
    const major = Math.floor(number / 1000000);
    const rest = String(number % 1000000).padStart(6, "0");
    return `${String(major).padStart(2, "0")}.${rest.slice(0, 3)}.${rest.slice(3)}`;
  }
  if (number >= 100) {
    return `${Math.floor(number / 100)}.${String(number % 100).padStart(2, "0")}`;
  }
  return raw;
}

function normalizePersianDigits(value) {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function parseSizeMb(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const raw = normalizePersianDigits(value).trim();
  const matches = raw.match(/[\d,.]+/g);
  if (!matches?.length) return null;

  const numeric = Number(matches[matches.length - 1].replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return null;

  return /gb|gib|گیگ|گيگ/i.test(raw) ? numeric * 1024 : numeric;
}

function normalizeDownloadParts(value) {
  return (Array.isArray(value) ? value : [])
    .map((part) => {
      const partNumber = Number(part?.partNumber);
      return {
        externalId: String(part?.externalId || part?.id || "").trim(),
        partNumber: Number.isFinite(partNumber) ? partNumber : null,
        fileName: String(part?.fileName || "").trim(),
        contentType: String(part?.contentType || part?.type || "").trim(),
        size: parseSizeMb(part?.size ?? part?.fileSize),
        hash: String(part?.hash || "").trim(),
        url: String(part?.url || part?.downloadUrl || part?.link || "").trim(),
      };
    })
    .filter((part) => part.url || part.fileName || part.hash || part.contentType || part.size !== null);
}

function getDownloadPartsTotalSize(parts, fallbackSize = "") {
  const total = (Array.isArray(parts) ? parts : []).reduce((sum, part) => {
    const value = parseSizeMb(part?.size);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);

  return total || parseSizeMb(fallbackSize);
}

function makeMediaFromUrl(url, alt = "") {
  const imageUrl = String(url || "").trim();
  if (!imageUrl) return "";

  return {
    alt: String(alt || "").trim(),
    type: "image",
    url: imageUrl,
  };
}

function normalizePsxHubDlcs(games) {
  const seen = new Set();
  return (Array.isArray(games) ? games : [])
    .flatMap((game) =>
      (Array.isArray(game?.dlcList) ? game.dlcList : []).map((dlc) => ({
        ...dlc,
        parentConsole: game?.console || game?.consoleTitle || "",
        parentRegion: game?.region || game?.piecesRegion || "",
        parentTitleId: game?.gameTitle || "",
      }))
    )
    .map((dlc) => {
      const parts = normalizeDownloadParts(dlc?.pieces || dlc?.latestVersionPieces || dlc?.downloadPieces);
      const title = String(dlc?.title || "").trim();
      const key = String(dlc?.id || title || parts[0]?.url || "").trim();
      if (!key || seen.has(key)) return null;
      seen.add(key);

      const contentType = parts.find((part) => part.contentType)?.contentType || "Dlc";
      const type = String(contentType).toLowerCase() === "dlc" ? "dlc" : contentType;
      const size = getDownloadPartsTotalSize(parts, dlc?.totalPiecesSize || dlc?.versionSize || dlc?.size);
      const version = normalizePsxHubVersion(dlc?.latestVersion || dlc?.version);

      return {
        externalId: dlc?.id ?? null,
        image: makeMediaFromUrl(dlc?.image, title),
        parts,
        platformKey: String(dlc?.parentConsole || "").trim().toUpperCase(),
        region: String(dlc?.parentRegion || "").trim(),
        title,
        titleId: String(dlc?.parentTitleId || "").trim().toUpperCase(),
        type,
        version,
        versionSize: size,
      };
    })
    .filter(Boolean);
}

function getPsxHubGameList(data) {
  return Array.isArray(data?.games)
    ? data.games
    : Array.isArray(data?.gameList)
      ? data.gameList
      : [];
}

function getPsxHubRowTitle(row, fallbackTitle = "") {
  return String(row?.fixedTitle || row?.title || row?.name || fallbackTitle || "").trim();
}

function getPsxHubRowIdentity(row, fallbackTitle = "") {
  const title = getPsxHubRowTitle(row, fallbackTitle).toLowerCase();
  return title || String(row?.gameTitle || row?.id || "").trim().toLowerCase();
}

function groupPsxHubGameRows(rows, fallbackTitle = "") {
  const groups = [];
  const groupIndexes = new Map();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const key = getPsxHubRowIdentity(row, fallbackTitle);
    if (!key) return;

    let groupIndex = groupIndexes.get(key);
    if (groupIndex === undefined) {
      groupIndex = groups.length;
      groupIndexes.set(key, groupIndex);
      groups.push({
        fixedTitle: getPsxHubRowTitle(row, fallbackTitle),
        games: [],
        title: getPsxHubRowTitle(row, fallbackTitle),
      });
    }

    groups[groupIndex].games.push(row);
  });

  return groups;
}

function getPsxHubCandidateGroups(data) {
  const root = data?.data || data;
  if (Array.isArray(root)) return root;

  const arrays = [root?.results, root?.items, root?.matches, root?.gameGroups, root?.groups].filter(Array.isArray);
  if (arrays[0]) return arrays[0];

  const rootGames = Array.isArray(root?.games) ? root.games : [];
  const gamesLookLikeGroups = rootGames.some((item) =>
    Array.isArray(item?.games) ||
    Array.isArray(item?.gameList) ||
    Array.isArray(item?.items) ||
    Array.isArray(item?.results)
  );
  if (gamesLookLikeGroups) return rootGames;
  if (rootGames.length) return groupPsxHubGameRows(rootGames, root?.fixedTitle || root?.title);

  return [root];
}

function makePsxHubSourceUrl(title) {
  return `https://psxhub.ir/api/GetGame/GetGameGroupWithPieces/${encodeURIComponent(title)}`;
}

function isUsRegion(value) {
  return String(value || "").trim().toUpperCase() === "US";
}

function formatPsxHubVersionLabel(value) {
  const version = String(value || "").trim();
  if (!version) return "";
  return version.toLowerCase().startsWith("v") ? version : `v${version}`;
}

function normalizePsxHubGroup(data, safeTitle, sourceUrl, index = 0) {
  const gameList = getPsxHubGameList(data);
  const rows = gameList
    .map((item) => {
      const updateParts = normalizeDownloadParts(item?.latestVersionPieces || item?.pieces || item?.downloadPieces);
      const baseParts = normalizeDownloadParts(item?.ps4BasePieces || item?.basePieces);
      const parts = [...baseParts, ...updateParts];
      const consoleTitle = String(item?.consoleTitle || item?.console || "").trim();
      const size = getDownloadPartsTotalSize(parts, item?.totalLatestVersionPiecesSize || item?.totalPs4BasePiecesSize || item?.size || item?.fileSize || item?.versionSize);

      return {
        externalId: item?.id ?? null,
        image: String(item?.image || data?.image || "").trim(),
        platformKey: consoleTitle.toUpperCase(),
        platformTitle: consoleTitle,
        region: String(item?.region || item?.piecesRegion || "").trim(),
        size,
        sourceTitle: String(item?.title || data?.title || safeTitle).trim(),
        sourceUrl,
        titleId: String(item?.gameTitle || "").trim().toUpperCase(),
        version: normalizePsxHubVersion(item?.latestVersion || item?.version),
        downloadUrl: String(item?.downloadUrl || item?.url || parts[0]?.url || "").trim(),
        notes: String(item?.description || item?.notes || data?.description || "").trim(),
        parts,
      };
    })
    .filter((item) => item.platformTitle || item.titleId || item.version || item.downloadUrl || item.parts.length);
  const platformSizes = rows
    .filter((item) => isUsRegion(item.region))
    .map((item) => {
      const size = parseSizeMb(item.size);
      if (size === null) return null;

      return {
        platformTitle: item.platformTitle,
        platformKey: item.platformKey,
        region: item.region,
        variant: formatPsxHubVersionLabel(item.version),
        version: item.version,
        size,
      };
    })
    .filter(Boolean);

  return {
    externalId: data?.id ?? data?.gameId ?? null,
    fixedTitle: String(data?.fixedTitle || data?.title || safeTitle).trim(),
    image: String(data?.image || "").trim(),
    index,
    sourceUrl,
    title: String(data?.title || safeTitle).trim(),
    dlcs: normalizePsxHubDlcs(gameList),
    downloads: rows,
    platformSizes,
  };
}

async function fetchPsxHubDownloads(title) {
  const safeTitle = String(title || "").trim();
  if (!safeTitle) throw makeServiceError("Game title is required", 400, "PSXHUB_TITLE_REQUIRED");

  const url = makePsxHubSourceUrl(safeTitle);
  const { data } = await axios.get(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    timeout: 20000,
  });

  const matches = getPsxHubCandidateGroups(data)
    .map((item, index) => normalizePsxHubGroup(item, safeTitle, url, index))
    .filter((item) => item.title || item.fixedTitle || item.downloads.length || item.dlcs.length);
  const selected = matches[0] || normalizePsxHubGroup(data, safeTitle, url, 0);

  return {
    ...selected,
    matches,
  };
}

function getPlayStationReleaseData(detail) {
  const releaseDate = detail?.release_date || detail?.releaseDate || detail?.localized_release_date;
  const platforms = Array.isArray(detail?.playable_platform)
    ? detail.playable_platform
    : Array.isArray(detail?.platforms)
      ? detail.platforms
      : [];

  return mergePlatformReleaseData(
    platforms
      .map((platform) => String(platform || "").toUpperCase())
      .filter((platform) => platform === "PS4" || platform === "PS5")
      .map((platform) => makePlatformRelease(platform, releaseDate, platform))
  );
}

function getXboxReleaseData(product) {
  const releaseDate =
    product?.MarketProperties?.[0]?.OriginalReleaseDate ||
    product?.MarketProperties?.[0]?.OriginalReleaseDateTime ||
    product?.Properties?.OriginalReleaseDate;
  if (!releaseDate) return [];

  const platforms = new Set(["xbox"]);
  const platformProperties = product?.Properties || {};
  const platformsText = JSON.stringify({
    platforms: platformProperties.Platforms,
    optimized: platformProperties.XboxConsoleGenOptimized,
    categories: platformProperties.Categories,
  }).toLowerCase();

  if (platformsText.includes("series")) platforms.add("xbox_series");
  if (platformsText.includes("xboxone") || platformsText.includes("xbox one")) platforms.add("xbox_one");

  return mergePlatformReleaseData(
    [...platforms].map((platform) =>
      makePlatformRelease(
        platform,
        releaseDate,
        platform === "xbox_series" ? "Xbox Series X|S" : platform === "xbox_one" ? "Xbox One" : "Xbox"
      )
    )
  );
}

function normalizeStoreTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getXboxProductIdFromText(value) {
  const text = String(value || "").trim();
  const storeUrlMatch = text.match(/xbox\.com\/[^)\s]+\/([a-z0-9]{12})(?:[/?#)\s]|$)/i);
  if (storeUrlMatch) return storeUrlMatch[1].toUpperCase();

  const productIdMatch = text.match(/\b([A-Z0-9]{12})\b/i);
  return productIdMatch ? productIdMatch[1].toUpperCase() : "";
}

function normalizeXboxBaseTitle(value) {
  return normalizeStoreTitle(String(value || "").replace(/\s*\([^)]*\)\s*/g, " "));
}

function normalizedTitleContainsPhrase(sourceTitle, requestedTitle) {
  const sourceTokens = normalizeStoreTitle(sourceTitle).split(" ").filter(Boolean);
  const requestedTokens = normalizeStoreTitle(requestedTitle).split(" ").filter(Boolean);
  if (!sourceTokens.length || !requestedTokens.length || requestedTokens.length > sourceTokens.length) return false;

  return sourceTokens.some((_, index) =>
    requestedTokens.every((token, offset) => sourceTokens[index + offset] === token)
  );
}

function pickXboxCatalogProduct(products, title) {
  const normalizedTitle = normalizeStoreTitle(title);
  if (!normalizedTitle) return products[0];

  const xboxTitlePriority = (item) => {
    const titleText = normalizeStoreTitle(item?.Title);
    const hasSeries = /\bseries\b/.test(titleText);
    const hasXboxOne = /\bxbox one\b/.test(titleText);
    if (hasSeries && !hasXboxOne) return 0;
    if (hasSeries) return 1;
    if (!hasXboxOne) return 2;
    return 3;
  };
  const bestTitle = (items) =>
    items
      .filter(Boolean)
      .sort((a, b) => xboxTitlePriority(a) - xboxTitlePriority(b) || String(a.Title || "").length - String(b.Title || "").length)[0];

  return (
    products.find((item) => normalizeStoreTitle(item.Title) === normalizedTitle) ||
    bestTitle(products.filter((item) => normalizeXboxBaseTitle(item.Title) === normalizedTitle)) ||
    bestTitle(products.filter((item) => normalizedTitleContainsPhrase(item.Title, normalizedTitle))) ||
    products[0]
  );
}

async function fetchXboxStorePageRating(productId, title) {
  const slug = normalizeStoreTitle(title).replace(/\s+/g, "-") || "product";
  const url = `https://www.xbox.com/en-US/games/store/${encodeURIComponent(slug)}/${encodeURIComponent(productId)}`;

  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000,
    });
    const match = String(data).match(/"aggregateRating"\s*:\s*(\{[^}]+\})/);
    if (!match) return null;

    const rating = JSON.parse(match[1]);
    const ratingValue = Number(rating?.ratingValue);
    return Number.isFinite(ratingValue) ? ratingValue : null;
  } catch (_) {
    return null;
  }
}

async function fetchPlayStationIntro(title, titleId = "") {
  const directProduct = await fetchPlayStationProductById(titleId);
  if (directProduct?.id || directProduct?.name || directProduct?.title_name) {
    const { data: detail } = directProduct.long_desc || directProduct.short_desc
      ? { data: directProduct }
      : { data: await fetchPlayStationContainer(directProduct.id || titleId) };

    const intro = cleanStoreIntro(detail?.long_desc || detail?.short_desc || "");
    if (intro) {
      return {
        intro: `Buy ${detail?.title_name || detail?.name || directProduct.name || title} on PlayStation Store. ${intro}`,
        platformReleases: getPlayStationReleaseData(detail),
        score: detail?.star_rating?.score ? Number(detail.star_rating.score) : null,
        starRating: normalizeStarRating(detail?.star_rating),
        sourceTitle: detail?.name || directProduct.name || "",
      };
    }
  }

  const searchText = normalizeStoreTitle(title) || title;
  if (!searchText) throw new Error("PlayStation product not found");

  const query = encodeURIComponent(searchText);
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
    platformReleases: getPlayStationReleaseData(detail),
    score: detail?.star_rating?.score ? Number(detail.star_rating.score) : null,
    starRating: normalizeStarRating(detail?.star_rating),
    sourceTitle: detail?.name || selected.name || "",
  };
}

const normalizePlayStationTitleId = (value) => {
  return String(value || "")
    .trim()
    .replace(/^["']+|["']+$/g, "");
};

const getPlayStationTitleCode = (value) => {
  const normalized = normalizePlayStationTitleId(value).replace(/[-_\s]+/g, "").toUpperCase();
  const match = normalized.match(/^(CUSA|PPSA|NPUB|NPEB|NPUA|NPEA|BLUS|BLES|BCUS|BCES|BCJS|BLJM|NPJB|NPJJ)(\d{4,6})$/);
  return match ? `${match[1]}${match[2]}` : "";
};

const getPlayStationLookupRegions = (...values) => {
  const text = values.map((value) => normalizePlayStationTitleId(value).toUpperCase()).join(" ");
  const regions = [];
  if (/(^|[^A-Z0-9])(EP|NPEB|NPEA|BLES|BCES|CUSA|PPSA)|EP\d{4}/.test(text)) regions.push("GB");
  if (/(^|[^A-Z0-9])(UP|NPUB|NPUA|BLUS|BCUS)|UP\d{4}/.test(text)) regions.push("US");
  if (/(^|[^A-Z0-9])(JP|NPJB|NPJJ|BLJM|BCJS)|JP\d{4}/.test(text)) regions.push("JP");
  return [...new Set([...regions, "US", "GB", "JP", "HK", "AE"])];
};

const expandPlayStationSearchText = (value) => {
  const raw = normalizePlayStationTitleId(value);
  const titleCode = getPlayStationTitleCode(raw);
  const spaced = raw
    .replace(/([a-z])(\d)/gi, "$1 $2")
    .replace(/(\d)([a-z])/gi, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  const withoutStandaloneNumbers = spaced
    .split(/\s+/)
    .filter((part) => !/^\d{3,}$/.test(part))
    .join(" ")
    .trim();
  const withoutProductPrefix = spaced
    .replace(/\b[UEJP][PPEAJ]?\d{3,5}\b/gi, "")
    .replace(/\b(CUSA|PPSA|NPUB|NPEB|EP|UP)\d*\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return [...new Set([raw, titleCode, spaced, withoutStandaloneNumbers, withoutProductPrefix].filter((item) => item.length >= 2))];
};

async function searchPlayStationStoreCandidates(...values) {
  const candidates = [...new Set(values.flatMap(expandPlayStationSearchText))];
  const regions = getPlayStationLookupRegions(...values);

  for (const region of regions) {
    for (const candidate of candidates) {
      try {
        const searchUrl = `https://store.playstation.com/store/api/chihiro/00_09_000/tumbler/${region}/en/19/${encodeURIComponent(candidate)}?size=8&suggested_size=0`;
        const { data } = await axios.get(searchUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
          timeout: 12000,
        });
        const links = Array.isArray(data?.links) ? data.links : [];
        if (links.length) return { data, region, searchText: candidate };
      } catch (_) {
        // Try the next relaxed candidate.
      }
    }
  }

  return { data: null, searchText: candidates[0] || "" };
}

async function fetchPlayStationContainer(productId) {
  const normalizedProductId = normalizePlayStationTitleId(productId);
  if (!normalizedProductId || /^\d{3,}$/.test(normalizedProductId)) return null;

  for (const region of getPlayStationLookupRegions(normalizedProductId)) {
    try {
      const detailUrl = `https://store.playstation.com/store/api/chihiro/00_09_000/container/${region}/en/19/${encodeURIComponent(normalizedProductId)}`;
      const { data } = await axios.get(detailUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 12000,
      });
      if (data?.id || data?.name || data?.title_name) return data;
    } catch (_) {
      // Try the same product id in the next store region.
    }
  }

  return null;
}

async function fetchPlayStationPatchMetadata(titleId) {
  const titleCode = getPlayStationTitleCode(titleId);
  if (!titleCode) return null;

  const prefix = titleCode.slice(0, 4);
  const source =
    prefix === "CUSA"
      ? `https://orbispatches.com/${titleCode}`
      : prefix === "PPSA"
        ? `https://prosperopatches.com/${titleCode}`
        : "";
  if (!source) return null;

  try {
    const { data } = await axios.get(source, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 12000,
    });
    const $ = cheerio.load(data);
    const title = $("h1").first().text().trim() || $("title").first().text().replace(/\|.*$/g, "").replace(titleCode, "").replace(/^[:\s-]+/, "").trim();
    const bodyText = $("body").text().replace(/\s+/g, " ");
    const contentId = bodyText.match(/\b[A-Z]{2}\d{4}-[A-Z]{4}\d{5,6}_00-[A-Z0-9_]{4,}\b/)?.[0] || "";
    return title ? { contentId, source, title, titleCode } : null;
  } catch (_) {
    return null;
  }
}

async function fetchPlayStation3TitleMetadata(titleId) {
  const titleCode = getPlayStationTitleCode(titleId);
  if (!/^(NPUB|NPEB|NPUA|NPEA|BLUS|BLES|BCUS|BCES|BCJS|BLJM|NPJB|NPJJ)/.test(titleCode)) return null;

  try {
    if (!playStation3TitleDbPromise) {
      playStation3TitleDbPromise = axios
        .get("https://raw.githubusercontent.com/shinrax2/PS3GameUpdateDownloader/master/titledb.json", {
          headers: { "User-Agent": "Mozilla/5.0" },
          timeout: 20000,
        })
        .then(({ data }) => (Array.isArray(data?.db) ? data.db : Array.isArray(data?.titles) ? data.titles : Array.isArray(data) ? data : []))
        .catch((error) => {
          playStation3TitleDbPromise = null;
          throw error;
        });
    }

    const titles = await playStation3TitleDbPromise;
    const found = titles.find((item) => normalizePlayStationTitleId(item?.id).replace(/[-_\s]+/g, "").toUpperCase() === titleCode);
    const title = String(found?.name || "").replace(/\s*\([^)]*\)\s*$/g, "").trim();
    return title ? { title, titleCode } : null;
  } catch (_) {
    return null;
  }
}

function resolveKnownPlayStationProductId(title, titleId) {
  const normalizedTitle = normalizeStoreTitle(title);
  const normalizedTitleId = normalizePlayStationTitleId(titleId);

  if (
    /(?:^|[^a-z0-9])(?:up)?1004(?:[^a-z0-9]|$)/i.test(normalizedTitleId) &&
    /red dead/.test(normalizedTitle) &&
    (/\b2\b/.test(normalizedTitle) || /\bii\b/.test(normalizedTitle) || /redemption 2/.test(normalizedTitle))
  ) {
    return "UP1004-CUSA03041_00-REDEMPTIONFULL02";
  }

  return "";
}

async function fetchPlayStationProductById(titleId) {
  const normalizedTitleId = normalizePlayStationTitleId(titleId);
  if (!normalizedTitleId) return null;
  if (/^\d{3,}$/.test(normalizedTitleId)) return null;
  const titleCode = getPlayStationTitleCode(normalizedTitleId);

  const directContainer = /^(CUSA|PPSA)/.test(titleCode) ? null : await fetchPlayStationContainer(normalizedTitleId);
  if (directContainer) return directContainer;

  const patchMetadata = await fetchPlayStationPatchMetadata(normalizedTitleId);
  const ps3Metadata = patchMetadata ? null : await fetchPlayStation3TitleMetadata(normalizedTitleId);
  if (/^(CUSA|PPSA)/.test(titleCode) && !patchMetadata) return null;
  const patchContainer = patchMetadata?.contentId ? await fetchPlayStationContainer(patchMetadata.contentId) : null;
  const normalizedPatchContainerTitle = normalizeStoreTitle(patchContainer?.name || patchContainer?.title_name || "");
  const normalizedPatchTitle = normalizeStoreTitle(patchMetadata?.title || "");
  if (patchContainer && (!normalizedPatchTitle || normalizedPatchContainerTitle === normalizedPatchTitle)) return patchContainer;

  try {
    const { data } = await searchPlayStationStoreCandidates(patchMetadata?.title || ps3Metadata?.title, normalizedTitleId, patchMetadata?.contentId);
    const items = Array.isArray(data?.links) ? data.links : [];
    const normalizedSearch = normalizeStoreTitle(normalizedTitleId);
    const normalizedKnownTitle = normalizedPatchTitle || normalizeStoreTitle(ps3Metadata?.title || "");
    const found =
      items.find((item) => normalizedKnownTitle && normalizeStoreTitle(item?.title_name || item?.name || "") === normalizedKnownTitle) ||
      items.find((item) => normalizedKnownTitle && normalizeStoreTitle(item?.title_name || item?.name || "").includes(normalizedKnownTitle)) ||
      items.find((item) => item?.id && normalizeStoreTitle(item.id).includes(normalizedSearch)) ||
      items.find((item) => normalizeStoreTitle(item?.title_name || item?.name || "").includes(normalizedSearch)) ||
      items.find((item) => item?.id && item?.container_type === "product") ||
      items.find((item) => item?.id) ||
      null;
    if (found) return found;
  } catch (_) {
    // Fall through to the patch title fallback below.
  }

  if (patchMetadata?.title) {
    return {
      id: patchMetadata.contentId || patchMetadata.titleCode || normalizedTitleId,
      name: patchMetadata.title,
      playable_platform: patchMetadata.titleCode.startsWith("PPSA") ? ["PS5"] : ["PS4™"],
      title_name: patchMetadata.title,
    };
  }

  if (ps3Metadata?.title) {
    return {
      id: ps3Metadata.titleCode || normalizedTitleId,
      name: ps3Metadata.title,
      playable_platform: ["PS3™"],
      title_name: ps3Metadata.title,
    };
  }

  return null;
}

async function suggestPlayStationGames(query, titleId = "") {
  const normalizedTitleId = normalizePlayStationTitleId(titleId);
  const directProduct = await fetchPlayStationProductById(resolveKnownPlayStationProductId(query, titleId) || titleId);
  if (directProduct) {
    return [
      {
        externalId: directProduct.id || normalizePlayStationTitleId(titleId),
        image: directProduct.images?.[0]?.url || directProduct.image || "",
        platform: getPlayStationPlatformLabel(directProduct),
        source: "playstation",
        title: directProduct.name || directProduct.title_name || query || normalizePlayStationTitleId(titleId),
        titleId: directProduct.id || normalizePlayStationTitleId(titleId),
      },
    ].filter((item) => item.title);
  }

  const searchText = normalizeStoreTitle(query) || query;
  if (!searchText) return [];

  const { data } = await searchPlayStationStoreCandidates(
    normalizedTitleId ? `${normalizedTitleId} ${searchText}` : "",
    searchText,
    titleId
  );

  const items = Array.isArray(data?.links) ? data.links : [];
  return items
    .map((item) => ({
      externalId: item.id || "",
      image: item.images?.[0]?.url || item.image || "",
      platform: "PlayStation",
      source: "playstation",
      title: item.name || item.title_name || "",
      titleId: item.id || "",
    }))
    .filter((item) => item.title);
}

function getPlayStationPlatformLabel(item) {
  const values = [
    ...(Array.isArray(item?.playable_platform) ? item.playable_platform : []),
    ...(Array.isArray(item?.default_sku?.entitlements)
      ? item.default_sku.entitlements.flatMap((entitlement) =>
          Array.isArray(entitlement?.packages)
            ? entitlement.packages.map((pkg) => pkg?.platformName)
            : []
        )
      : []),
  ]
    .map((value) => String(value || "").toUpperCase())
    .filter(Boolean);

  const ordered = ["PS5", "PS4", "PS3"].filter((platform) => values.some((value) => value.includes(platform)));
  return ordered.length ? ordered.join(" / ") : "PlayStation";
}

function collectPlayStationGalleryImages(item) {
  const rawImages = [
    ...(Array.isArray(item?.mediaList?.screenshots) ? item.mediaList.screenshots : []),
    ...(Array.isArray(item?.images) ? item.images : []),
    ...(item?.image ? [{ type: "PRODUCT_IMAGE", url: item.image }] : []),
    ...(Array.isArray(item?.mediaList?.previews)
      ? item.mediaList.previews.flatMap((preview) =>
          Array.isArray(preview?.shots) ? preview.shots.map((url) => ({ type: "PREVIEW_SHOT", url })) : []
        )
      : []),
  ];

  return rawImages
    .map((image) => ({
      imageType: String(image?.type || image?.typeId || ""),
      url: typeof image === "string" ? image : String(image?.url || "").trim(),
    }))
    .filter((image) => image.url && !/\.(mp4|m3u8)(\?|$)/i.test(image.url));
}

async function suggestPlayStationGalleryImages(query, titleId = "") {
  const normalizedTitleId = normalizePlayStationTitleId(titleId);
  const directProduct = await fetchPlayStationProductById(resolveKnownPlayStationProductId(query, titleId) || titleId);
  const searchText = normalizeStoreTitle(query) || query;
  let data = null;

  if (searchText) {
    ({ data } = await searchPlayStationStoreCandidates(
      normalizedTitleId ? `${normalizedTitleId} ${searchText}` : "",
      searchText,
      titleId
    ));
  }

  const normalizedQuery = normalizeStoreTitle(query);
  const items = [
    ...(directProduct ? [directProduct] : []),
    ...(Array.isArray(data?.links) ? data.links : []),
  ]
    .filter((item) => item?.id && (item === directProduct || item?.container_type === "product"))
    .sort((a, b) => {
      const aTitle = normalizeStoreTitle(a?.title_name || a?.name || "");
      const bTitle = normalizeStoreTitle(b?.title_name || b?.name || "");
      return Number(!aTitle.includes(normalizedQuery)) - Number(!bTitle.includes(normalizedQuery));
    })
    .slice(0, 4);

  const details = await Promise.allSettled(
    items.map(async (item) => {
      const detail = (await fetchPlayStationContainer(item.id)) || item;
      return { item, detail };
    })
  );

  const seen = new Set();
  const suggestions = [];

  details.forEach((result) => {
    if (result.status !== "fulfilled") return;
    const source = result.value.detail || result.value.item;
    const fallback = result.value.item || {};
    const title = source.title_name || source.name || fallback.title_name || fallback.name || query;
    const platform = getPlayStationPlatformLabel(source);
    const images = [
      ...collectPlayStationGalleryImages(source),
      ...collectPlayStationGalleryImages(fallback),
    ];
    images.forEach((image, index) => {
      if (seen.has(image.url)) return;
      seen.add(image.url);
      suggestions.push({
        externalId: `${source.id || fallback.id || "playstation"}-${index}`,
        imageType: image.imageType,
        platform,
        source: "playstation",
        title,
        url: image.url,
      });
    });
  });

  return suggestions.slice(0, 24);
}

async function fetchXboxIntro(title) {
  const directProductId = getXboxProductIdFromText(title);
  if (directProductId) {
    const detailUrl = `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${encodeURIComponent(directProductId)}&market=US&languages=en-US&MS-CV=DGU1mcuYo0WMMp`;
    const { data: detailData } = await axios.get(detailUrl, { timeout: 15000 });
    const product = detailData?.Products?.[0];
    const localized = product?.LocalizedProperties?.[0] || {};
    const intro = cleanStoreIntro(localized.ProductDescription || localized.ShortDescription || "");
    if (!intro) throw new Error("Xbox intro not found");

    const allTimeRating = (product?.MarketProperties?.[0]?.UsageData || []).find(
      (item) => item?.AggregateTimeSpan === "AllTime"
    );
    const pageRating = await fetchXboxStorePageRating(directProductId, localized.ProductTitle || title);
    const xboxRating = normalizeXboxRating({
      averageRating: pageRating ?? allTimeRating?.AverageRating,
      total: allTimeRating?.RatingCount || allTimeRating?.TotalRatings || allTimeRating?.UsersRated,
    });

    return {
      intro,
      platformReleases: getXboxReleaseData(product),
      score: xboxRating?.score ? Number(xboxRating.score) : pageRating ?? (allTimeRating?.AverageRating ? Number(allTimeRating.AverageRating) : null),
      sourceTitle: localized.ProductTitle || title,
      xboxRating: xboxRating ?? null,
    };
  }

  const query = encodeURIComponent(title);
  const suggestUrl = `https://displaycatalog.mp.microsoft.com/v7.0/productFamilies/autosuggest?market=US&languages=en-US&query=${query}&productFamilyNames=Games&top=8`;
  const { data: suggestData } = await axios.get(suggestUrl, { timeout: 15000 });
  const products = (suggestData?.Results || []).flatMap((group) => group?.Products || []);
  const selected = pickXboxCatalogProduct(products, title);

  if (!selected?.ProductId) throw makeServiceError("Xbox product not found", 404, "XBOX_PRODUCT_NOT_FOUND");

  const detailUrl = `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${encodeURIComponent(selected.ProductId)}&market=US&languages=en-US&MS-CV=DGU1mcuYo0WMMp`;
  const { data: detailData } = await axios.get(detailUrl, { timeout: 15000 });
  const product = detailData?.Products?.[0];
  const localized = product?.LocalizedProperties?.[0] || {};
  const intro = cleanStoreIntro(localized.ProductDescription || localized.ShortDescription || "");
  if (!intro) throw new Error("Xbox intro not found");

  const allTimeRating = (product?.MarketProperties?.[0]?.UsageData || []).find(
    (item) => item?.AggregateTimeSpan === "AllTime"
  );
  const pageRating = await fetchXboxStorePageRating(selected.ProductId, localized.ProductTitle || selected.Title || title);
  const xboxRating = normalizeXboxRating({
    averageRating: pageRating ?? allTimeRating?.AverageRating,
    total: allTimeRating?.RatingCount || allTimeRating?.TotalRatings || allTimeRating?.UsersRated,
  });

  return {
    intro,
    platformReleases: getXboxReleaseData(product),
    score: xboxRating?.score ? Number(xboxRating.score) : pageRating ?? (allTimeRating?.AverageRating ? Number(allTimeRating.AverageRating) : null),
    sourceTitle: localized.ProductTitle || selected.Title || "",
    xboxRating: xboxRating ?? null,
  };
}

async function suggestXboxGames(query) {
  const suggestUrl = `https://displaycatalog.mp.microsoft.com/v7.0/productFamilies/autosuggest?market=US&languages=en-US&query=${encodeURIComponent(query)}&productFamilyNames=Games&top=8`;
  const { data } = await axios.get(suggestUrl, { timeout: 12000 });
  const products = (data?.Results || []).flatMap((group) => group?.Products || []);

  return products
    .map((item) => ({
      externalId: item.ProductId || "",
      image: item.ImageUrl || "",
      platform: "Xbox",
      source: "xbox",
      title: item.Title || "",
    }))
    .filter((item) => item.title);
}

async function findXboxCatalogGame(title) {
  const directProductId = getXboxProductIdFromText(title);
  if (directProductId) {
    const detailUrl = `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${encodeURIComponent(directProductId)}&market=US&languages=en-US&MS-CV=DGU1mcuYo0WMMp`;
    const { data: detailData } = await axios.get(detailUrl, { timeout: 15000 });
    const product = detailData?.Products?.[0];
    const localized = product?.LocalizedProperties?.[0] || {};
    const titleId = (product?.AlternateIds || []).find((item) => item?.IdType === "XboxTitleId")?.Value;

    return {
      productId: directProductId,
      sourceTitle: localized.ProductTitle || title,
      titleId: titleId || "",
    };
  }

  const query = encodeURIComponent(title);
  const suggestUrl = `https://displaycatalog.mp.microsoft.com/v7.0/productFamilies/autosuggest?market=US&languages=en-US&query=${query}&productFamilyNames=Games&top=8`;
  const { data: suggestData } = await axios.get(suggestUrl, { timeout: 15000 });
  const products = (suggestData?.Results || []).flatMap((group) => group?.Products || []);
  const selected = pickXboxCatalogProduct(products, title);

  if (!selected?.ProductId) throw makeServiceError("Xbox product not found", 404, "XBOX_PRODUCT_NOT_FOUND");

  const detailUrl = `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${encodeURIComponent(selected.ProductId)}&market=US&languages=en-US&MS-CV=DGU1mcuYo0WMMp`;
  const { data: detailData } = await axios.get(detailUrl, { timeout: 15000 });
  const product = detailData?.Products?.[0];
  const localized = product?.LocalizedProperties?.[0] || {};
  const titleId = (product?.AlternateIds || []).find((item) => item?.IdType === "XboxTitleId")?.Value;

  return {
    productId: selected.ProductId,
    sourceTitle: localized.ProductTitle || selected.Title || title,
    titleId: titleId || "",
  };
}

function getConfiguredXboxAuthorizationHeader() {
  const directToken = String(process.env.XBOX_LIVE_AUTHORIZATION || "").trim();
  if (directToken) return directToken.startsWith("XBL3.0") ? directToken : `XBL3.0 ${directToken}`;

  const userHash = String(process.env.XBOX_LIVE_USER_HASH || "").trim();
  const token = String(process.env.XBOX_LIVE_TOKEN || "").trim();
  if (userHash && token) return `XBL3.0 x=${userHash};${token}`;

  return "";
}

function getXboxOAuthConfig() {
  return {
    clientId: String(process.env.XBOX_LIVE_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID || "").trim(),
    clientSecret: String(process.env.XBOX_LIVE_CLIENT_SECRET || process.env.MICROSOFT_CLIENT_SECRET || "").trim(),
    refreshToken: String(process.env.XBOX_LIVE_REFRESH_TOKEN || process.env.MICROSOFT_REFRESH_TOKEN || "").trim(),
    scope: String(process.env.XBOX_LIVE_SCOPE || "XboxLive.signin offline_access").trim(),
  };
}

async function refreshMicrosoftAccessToken() {
  const { clientId, clientSecret, refreshToken, scope } = getXboxOAuthConfig();
  if (!clientId || !refreshToken) {
    throw makeServiceError("Xbox Live refresh token is not configured", 424, "XBOX_AUTH_NOT_CONFIGURED");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope,
  });
  if (clientSecret) body.set("client_secret", clientSecret);

  const { data } = await axios.post("https://login.live.com/oauth20_token.srf", body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 15000,
  });

  const accessToken = String(data?.access_token || "").trim();
  if (!accessToken) {
    throw makeServiceError("Microsoft access token was not returned", 424, "XBOX_AUTH_EXPIRED");
  }

  if (data?.refresh_token) {
    process.env.XBOX_LIVE_REFRESH_TOKEN = String(data.refresh_token);
  }

  return accessToken;
}

async function getXboxUserToken(accessToken) {
  const { data } = await axios.post(
    "https://user.auth.xboxlive.com/user/authenticate",
    {
      Properties: {
        AuthMethod: "RPS",
        SiteName: "user.auth.xboxlive.com",
        RpsTicket: `d=${accessToken}`,
      },
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT",
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-xbl-contract-version": "1",
      },
      timeout: 15000,
    }
  );

  const token = String(data?.Token || "").trim();
  if (!token) throw makeServiceError("Xbox user token was not returned", 424, "XBOX_AUTH_EXPIRED");
  return token;
}

async function getXboxXstsToken(userToken) {
  const { data } = await axios.post(
    "https://xsts.auth.xboxlive.com/xsts/authorize",
    {
      Properties: {
        SandboxId: "RETAIL",
        UserTokens: [userToken],
      },
      RelyingParty: "http://xboxlive.com",
      TokenType: "JWT",
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-xbl-contract-version": "1",
      },
      timeout: 15000,
    }
  );

  const token = String(data?.Token || "").trim();
  const userClaims = data?.DisplayClaims?.xui?.[0] || {};
  const userHash = String(userClaims.uhs || "").trim();
  const xuid = String(userClaims.xid || "").trim();
  if (!token || !userHash) {
    throw makeServiceError("Xbox XSTS token was not returned", 424, "XBOX_AUTH_EXPIRED");
  }

  return { token, userHash, xuid };
}

async function refreshXboxAuthorizationHeader() {
  try {
    const accessToken = await refreshMicrosoftAccessToken();
    const userToken = await getXboxUserToken(accessToken);
    const xsts = await getXboxXstsToken(userToken);
    const authorization = `XBL3.0 x=${xsts.userHash};${xsts.token}`;

    process.env.XBOX_LIVE_AUTHORIZATION = authorization;
    process.env.XBOX_LIVE_USER_HASH = xsts.userHash;
    process.env.XBOX_LIVE_TOKEN = xsts.token;
    if (xsts.xuid) process.env.XBOX_LIVE_XUID = xsts.xuid;

    return authorization;
  } catch (error) {
    throw mapXboxError(error);
  }
}

async function getXboxAuthorizationHeader(options = {}) {
  if (options.forceRefresh) return refreshXboxAuthorizationHeader();

  const configuredAuthorization = getConfiguredXboxAuthorizationHeader();
  if (configuredAuthorization) return configuredAuthorization;

  return refreshXboxAuthorizationHeader();
}

async function xboxLiveGet(url, config = {}) {
  let authorization = await getXboxAuthorizationHeader();

  const request = (authHeader) =>
    axios.get(url, {
      ...config,
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-US",
        "x-xbl-contract-version": "2",
        ...(config.headers || {}),
        Authorization: authHeader,
      },
    });

  try {
    return await request(authorization);
  } catch (error) {
    if (!isXboxAuthError(error)) throw mapXboxError(error);
    try {
      authorization = await getXboxAuthorizationHeader({ forceRefresh: true });
    } catch (refreshError) {
      if (refreshError?.code === "XBOX_AUTH_NOT_CONFIGURED") throw mapXboxError(error);
      throw refreshError;
    }
    try {
      return await request(authorization);
    } catch (retryError) {
      throw mapXboxError(retryError);
    }
  }
}

function normalizeXboxAchievement(item) {
  const mediaAsset = (item?.mediaAssets || []).find((asset) => /icon/i.test(asset?.type || "")) || item?.mediaAssets?.[0] || {};
  const gamerscore = (item?.rewards || []).find((reward) => /gamerscore/i.test(reward?.type || ""))?.value;
  const name = item?.name || item?.localizedProperties?.name || "";
  const description = item?.description || item?.unlockedDescription || item?.lockedDescription || "";

  return {
    id: item?.id || item?.serviceConfigId || name,
    description,
    gamerscore: gamerscore ?? null,
    icon: mediaAsset?.url || "",
    isSecret: Boolean(item?.isSecret),
    name,
    progressState: item?.progressState || "",
    rarity: item?.rarity?.currentCategory || "",
  };
}

function normalizeComparableTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/\b(ps4|ps5|playstation|standard|edition|deluxe|ultimate|complete|bundle|game|version)\b/g, " ")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleMatches(sourceTitle, requestedTitle) {
  const source = normalizeComparableTitle(sourceTitle);
  const requested = normalizeComparableTitle(requestedTitle);
  if (!source || !requested) return false;
  return source === requested || source.includes(requested) || requested.includes(source);
}

async function findXboxUserTitle(xuid, title) {
  let data;
  try {
    ({ data } = await xboxLiveGet(
      `https://titlehub.xboxlive.com/users/xuid(${encodeURIComponent(xuid)})/titles/titlehistory/decoration/detail,scid,image,achievement`,
      {
        params: { maxItems: 1000 },
        timeout: 15000,
      }
    ));
  } catch (error) {
    throw mapXboxError(error);
  }

  const titles = Array.isArray(data?.titles) ? data.titles : [];
  const selected =
    titles.find((item) => titleMatches(item?.name || item?.titleName, title)) ||
    titles.find((item) => normalizeComparableTitle(item?.name || item?.titleName).includes(normalizeComparableTitle(title)));

  if (!selected?.titleId) throw makeServiceError("Xbox title id not found", 404, "XBOX_TITLE_ID_NOT_FOUND");

  return {
    sourceTitle: selected.name || selected.titleName || title,
    titleId: String(selected.titleId),
  };
}

async function fetchXboxAchievements(title, requestedTitleId = "") {
  await getXboxAuthorizationHeader();
  const xuid = String(process.env.XBOX_LIVE_XUID || "").trim();

  if (!xuid) {
    throw makeServiceError("Xbox Live credentials are not configured", 424, "XBOX_AUTH_NOT_CONFIGURED");
  }

  const manualTitleId = String(requestedTitleId || "").trim();
  const catalogGame = manualTitleId
    ? { productId: "", sourceTitle: title, titleId: manualTitleId }
    : await findXboxCatalogGame(title);
  if (!catalogGame.titleId) {
    const userTitle = await findXboxUserTitle(xuid, title);
    catalogGame.sourceTitle = userTitle.sourceTitle || catalogGame.sourceTitle;
    catalogGame.titleId = userTitle.titleId;
  }

  let data;
  try {
    ({ data } = await xboxLiveGet(
      `https://achievements.xboxlive.com/users/xuid(${encodeURIComponent(xuid)})/achievements`,
      {
        params: {
          maxItems: 100,
          titleId: catalogGame.titleId,
        },
        timeout: 15000,
      }
    ));
  } catch (error) {
    throw mapXboxError(error);
  }

  const achievements = Array.isArray(data?.achievements) ? data.achievements.map(normalizeXboxAchievement) : [];

  return {
    achievements,
    productId: catalogGame.productId,
    sourceTitle: catalogGame.sourceTitle,
    titleId: catalogGame.titleId,
    total: Number(data?.pagingInfo?.totalRecords || achievements.length || 0),
  };
}

async function getPlayStationAuthorization() {
  const npsso = String(process.env.PSN_NPSSO || "").trim();
  if (!npsso) {
    throw makeServiceError("PlayStation NPSSO is not configured", 424, "PSN_AUTH_NOT_CONFIGURED");
  }

  try {
    const accessCode = await exchangeNpssoForAccessCode(npsso);
    const authorization = await exchangeAccessCodeForAuthTokens(accessCode);
    return { accessToken: authorization.accessToken };
  } catch (error) {
    throw mapPlayStationError(error);
  }
}

function normalizePlayStationTrophy(item) {
  return {
    id: item?.trophyId ?? item?.trophyName ?? "",
    description: item?.trophyDetail || "",
    icon: item?.trophyIconUrl || "",
    isSecret: Boolean(item?.trophyHidden),
    name: item?.trophyName || "",
    rarity: item?.trophyRare ?? null,
    type: item?.trophyType || "",
  };
}

function normalizeNpCommunicationId(value) {
  const raw = String(value || "").trim().toUpperCase();
  const match = raw.match(/NPWR[-_\s]?(\d{5,})(?:[-_\s]?(\d{2}))?/);
  if (!match) return "";
  return `NPWR${match[1]}_${match[2] || "00"}`;
}

async function fetchPlayStationTrophyEndpoint(authorization, npCommunicationId, options = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit || 200));
  if (options.offset !== undefined) params.set("offset", String(options.offset));
  if (options.npServiceName) params.set("npServiceName", options.npServiceName);

  const url = `https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${encodeURIComponent(npCommunicationId)}/trophyGroups/all/trophies?${params.toString()}`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${authorization.accessToken}`,
      "Accept-Language": "en-US",
      "User-Agent": "Mozilla/5.0",
    },
    timeout: 15000,
  });

  return data;
}

async function getPlayStationTitleTrophies(authorization, npCommunicationId, options = {}) {
  const attempts = [];
  if (options.platform === "PS5") attempts.push(undefined, "trophy");
  else if (options.platform) attempts.push("trophy", undefined);
  else attempts.push("trophy", undefined);

  let lastError = null;
  for (const npServiceName of attempts) {
    try {
      const trophiesData = await getTitleTrophies(authorization, npCommunicationId, "all", {
        headerOverrides: { "Accept-Language": "en-US" },
        limit: 200,
        npServiceName,
      });
      if (Array.isArray(trophiesData?.trophies) && trophiesData.trophies.length) return trophiesData;
      if (Number(trophiesData?.totalItemCount || 0) > 0) return trophiesData;
      lastError = new Error("PlayStation title trophies returned empty");
    } catch (error) {
      lastError = mapPlayStationError(error);
    }

    try {
      const trophiesData = await fetchPlayStationTrophyEndpoint(authorization, npCommunicationId, {
        limit: 200,
        npServiceName,
      });
      if (Array.isArray(trophiesData?.trophies) && trophiesData.trophies.length) return trophiesData;
      if (Number(trophiesData?.totalItemCount || 0) > 0) return trophiesData;
      lastError = new Error("PlayStation title trophies returned empty");
    } catch (error) {
      lastError = mapPlayStationError(error);
    }
  }

  throw lastError || new Error("PlayStation title trophies not found");
}

async function resolvePlayStationTrophyTitle(authorization, title, npCommunicationId) {
  const directNpCommunicationId = normalizeNpCommunicationId(npCommunicationId || title);
  if (directNpCommunicationId) {
    return {
      npCommunicationId: directNpCommunicationId,
      resolveSource: "manual",
      trophyTitleName: title || directNpCommunicationId,
      trophyTitlePlatform: "",
    };
  }

  let titlesData;
  try {
    titlesData = await getUserTitles(authorization, "me", {
      headerOverrides: { "Accept-Language": "en-US" },
      limit: 800,
    });
  } catch (error) {
    throw mapPlayStationError(error);
  }
  const titles = Array.isArray(titlesData?.trophyTitles) ? titlesData.trophyTitles : [];
  const selected =
    titles.find((item) => titleMatches(item?.trophyTitleName, title)) ||
    titles.find((item) => normalizeComparableTitle(item?.trophyTitleName).includes(normalizeComparableTitle(title)));

  if (selected?.npCommunicationId) {
    return { ...selected, resolveSource: "account" };
  }

  throw makeServiceError("PlayStation trophy title not found", 404, "PSN_TITLE_NOT_FOUND");
}

async function fetchPlayStationTrophies(title, npCommunicationId = "") {
  const authorization = await getPlayStationAuthorization();
  const selected = await resolvePlayStationTrophyTitle(authorization, title, npCommunicationId);
  const trophiesData = await getPlayStationTitleTrophies(authorization, selected.npCommunicationId, {
    platform: selected.trophyTitlePlatform,
  });
  const trophies = Array.isArray(trophiesData?.trophies) ? trophiesData.trophies.map(normalizePlayStationTrophy) : [];

  return {
    npCommunicationId: selected.npCommunicationId,
    platform: selected.trophyTitlePlatform || "",
    resolveSource: selected.resolveSource || "account",
    sourceTitle: selected.trophyTitleName || title,
    trophies,
    total:
      Number(trophiesData?.totalItemCount || 0) ||
      Number(selected?.definedTrophies?.bronze || 0) +
        Number(selected?.definedTrophies?.silver || 0) +
        Number(selected?.definedTrophies?.gold || 0) +
        Number(selected?.definedTrophies?.platinum || 0) ||
      trophies.length,
  };
}

function normalizeScore100(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeScore5(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(5, Number(score.toFixed(2))));
}

function normalizeSubmittedStoreScore5(value) {
  const score = toNumber(value);
  if (score === null) return null;
  if (score > 5) return normalizeScore5(score / 20);
  return normalizeScore5(score);
}

function normalizeStarRating(value) {
  if (!value || typeof value !== "object") return undefined;
  const score = normalizeScore5(value.score);
  const total = Number(value.total);
  const count = Array.isArray(value.count)
    ? value.count
        .map((item) => ({
          count: Math.max(0, Math.round(Number(item?.count || 0))),
          score: Math.max(1, Math.min(5, Math.round(Number(item?.score ?? item?.star ?? 0)))),
        }))
        .filter((item) => item.score >= 1 && item.score <= 5)
    : [];

  if (score === null && !Number.isFinite(total) && !count.length) return undefined;

  return {
    total: Number.isFinite(total) ? String(Math.max(0, Math.round(total))) : "",
    score: score === null ? "" : score.toFixed(2),
    count,
  };
}

function normalizeSteamRating(value) {
  if (!value || typeof value !== "object") return undefined;
  const totalReviews = Number(value.totalReviews ?? value.total ?? 0);
  const totalPositive = Number(value.totalPositive ?? value.positive ?? 0);
  const explicitScore = toNumber(value.score);
  const score =
    explicitScore !== null
      ? normalizeScore5(explicitScore)
      : totalReviews > 0
        ? normalizeScore5((Math.max(0, totalPositive) / totalReviews) * 5)
        : null;

  if (score === null && !Number.isFinite(totalReviews)) return undefined;

  return {
    total: Number.isFinite(totalReviews) ? String(Math.max(0, Math.round(totalReviews))) : "",
    score: score === null ? "" : score.toFixed(2),
    count: [],
  };
}

function normalizeXboxRating(value) {
  if (!value || typeof value !== "object") return undefined;
  const totalValue = value.total ?? value.ratingCount ?? value.RatingCount ?? value.TotalRatings ?? value.UsersRated;
  const total = Number(totalValue);
  const score = normalizeScore5(value.score ?? value.averageRating ?? value.AverageRating);

  if (score === null && !Number.isFinite(total)) return undefined;

  return {
    total: Number.isFinite(total) ? String(Math.max(0, Math.round(total))) : "",
    score: score === null ? "" : score.toFixed(2),
    count: [],
  };
}

function parseStarRatingValue(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value === "object") return normalizeStarRating(value) ?? null;

  try {
    return normalizeStarRating(JSON.parse(value)) ?? null;
  } catch (_) {
    return null;
  }
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
  const steamRating = normalizeSteamRating({ totalPositive, totalReviews });
  const steamScore = steamRating?.score ? Number(steamRating.score) : null;
  const metacriticScore = normalizeScore100(detail?.metacritic?.score || selected?.metascore);

  return {
    appid,
    metacriticScore,
    sourceTitle: detail.name || selected.name || "",
    steamRating: steamRating ?? null,
    steamScore,
  };
}

async function suggestSteamGames(query) {
  const { data } = await axios.get("https://store.steampowered.com/api/storesearch/", {
    params: { term: query, l: "english", cc: "US" },
    timeout: 12000,
  });

  const items = Array.isArray(data?.items) ? data.items : [];
  return items
    .map((item) => ({
      externalId: item.id ? String(item.id) : "",
      image: item.tiny_image || "",
      platform: "Steam",
      source: "steam",
      title: item.name || "",
    }))
    .filter((item) => item.title);
}

function mergeGameSuggestions(groups, limit = 10) {
  const seen = new Set();
  const suggestions = [];

  groups.flat().forEach((item) => {
    const title = String(item?.title || "").trim();
    if (!title) return;

    const key = normalizeStoreTitle(title);
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push({ ...item, title });
  });

  return suggestions.slice(0, limit);
}

async function fetchXboxScores(title) {
  const data = await fetchXboxIntro(title);
  return {
    sourceTitle: data.sourceTitle,
    xboxScore: normalizeScore5(data.score),
    xboxRating: data.xboxRating ?? null,
    platformReleases: data.platformReleases || [],
  };
}

async function fetchPlayStationScores(title) {
  const data = await fetchPlayStationIntro(title);
  return {
    platformReleases: data.platformReleases || [],
    sourceTitle: data.sourceTitle,
    sonyScore: normalizeScore5(data.score),
    starRating: data.starRating ?? null,
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
    platformReleases: mergePlatformReleaseData(
      playStationData.platformReleases || [],
      xboxData.platformReleases || []
    ),
    sourceTitle: steamData.sourceTitle || xboxData.sourceTitle || playStationData.sourceTitle || "",
    sonyScore: playStationData.sonyScore ?? null,
    starRating: playStationData.starRating ?? null,
    steamRating: steamData.steamRating ?? null,
    steamScore: steamData.steamScore ?? null,
    xboxRating: xboxData.xboxRating ?? null,
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

function normalizeSubmittedObjectId(value) {
  const raw = value && typeof value === "object" ? value._id || value.id || value.value : value;
  const id = String(raw || "").trim();
  return mongoose.Types.ObjectId.isValid(id) ? id : null;
}

function parseObjectIdArray(value) {
  if (value === undefined || value === null || value === "") return [];
  const rawItems = Array.isArray(value)
    ? value
    : (() => {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : null;
        } catch (_) {
          return null;
        }
      })();

  const items = rawItems || String(value).split(",");
  return items.map(normalizeSubmittedObjectId).filter(Boolean);
}

const offlinePlayerCatalog = [
  {
    key: "none",
    title_fa: "نداره",
    title_en: "No offline players",
    min: 0,
    max: 0,
    legacyValues: ["no", "none", "0", "ندارد", "نداره"],
  },
  {
    key: "single-player",
    title_fa: "تک نفره",
    title_en: "Single-player",
    min: 1,
    max: 1,
    legacyValues: ["offline_1", "single_player", "تک نفره", "تک‌نفره", "1"],
  },
  {
    key: "1-2",
    title_fa: "۱ - ۲ نفره",
    title_en: "1-2 players",
    min: 1,
    max: 2,
    legacyValues: ["1-2 نفره", "1 تا 2 نفر", "۱-۲ نفره", "۱ - ۲ نفره", "۱ تا ۲ نفر"],
  },
  {
    key: "1-3",
    title_fa: "۱ - ۳ نفره",
    title_en: "1-3 players",
    min: 1,
    max: 3,
    legacyValues: ["1-3 نفره", "1 تا 3 نفر", "۱-۳ نفره", "۱ - ۳ نفره", "۱ تا ۳ نفر"],
  },
  {
    key: "1-4",
    title_fa: "۱ - ۴ نفره",
    title_en: "1-4 players",
    min: 1,
    max: 4,
    legacyValues: ["offline_1_4", "1-4 نفره", "۱-۴ نفره", "۱ - ۴ نفره", "تا 4 نفر", "تا ۴ نفر", "up_to_4", "up-to-4"],
  },
  {
    key: "2",
    title_fa: "۲ نفره",
    title_en: "2 players",
    min: 2,
    max: 2,
    legacyValues: ["2", "2 نفره", "۲ نفره"],
  },
];

const normalizedOfflinePlayerCatalog = [
  {
    key: "none",
    title_fa: "نداره",
    title_en: "No offline players",
    min: 0,
    max: 0,
    legacyValues: ["no", "none", "0", "ندارد", "نداره"],
  },
  {
    key: "single-player",
    title_fa: "تک نفره",
    title_en: "Single-player",
    min: 1,
    max: 1,
    legacyValues: ["offline_1", "single_player", "تک نفره", "تک‌نفره", "1"],
  },
  {
    key: "1-2",
    title_fa: "۱ - ۲ نفره",
    title_en: "1-2 players",
    min: 1,
    max: 2,
    legacyValues: ["1-2 نفره", "1 تا 2 نفر", "۱-۲ نفره", "۱ - ۲ نفره", "۱ تا ۲ نفر"],
  },
  {
    key: "1-3",
    title_fa: "۱ - ۳ نفره",
    title_en: "1-3 players",
    min: 1,
    max: 3,
    legacyValues: ["1-3 نفره", "1 تا 3 نفر", "۱-۳ نفره", "۱ - ۳ نفره", "۱ تا ۳ نفر"],
  },
  {
    key: "1-4",
    title_fa: "۱ - ۴ نفره",
    title_en: "1-4 players",
    min: 1,
    max: 4,
    legacyValues: ["offline_1_4", "1-4 نفره", "1 تا 4 نفر", "۱-۴ نفره", "۱ - ۴ نفره", "۱ تا ۴ نفر", "تا 4 نفر", "تا ۴ نفر", "up_to_4", "up-to-4", "3-4", "3-4 نفره", "۳-۴ نفره"],
  },
  {
    key: "2",
    title_fa: "۲ نفره",
    title_en: "2 players",
    min: 2,
    max: 2,
    legacyValues: ["2", "2 نفره", "۲ نفره"],
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
  const text = String(value).trim();
  const dateParts = text.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  const date = dateParts
    ? new Date(Number(dateParts[3]), Number(dateParts[1]) - 1, Number(dateParts[2]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isPrivilegedAdmin(admin = {}) {
  return ["owner", "superAdmin"].includes(admin.role);
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

function normalizeDiscountPercent(value) {
  const number = toNumber(value, 0);
  return Math.max(0, Math.min(100, number || 0));
}

function calculateDiscountedPrice(price, discountPercent) {
  const numericPrice = toNumber(price);
  if (numericPrice === null) return null;
  const discount = normalizeDiscountPercent(discountPercent);
  return Math.max(0, Math.round(numericPrice - (numericPrice * discount) / 100));
}

function parseExtraEditionItems(value) {
  return parseObjectArray(value, (item) => {
    const price = toNumber(item?.price);
    const discountPercent = normalizeDiscountPercent(item?.discountPercent);
    return {
      platform: String(item?.platform || "").trim() || null,
      capacityType: String(item?.capacityType || "").trim(),
      price,
      discountPercent,
      discountedPrice: calculateDiscountedPrice(price, discountPercent),
    };
  }).filter(
    (item) =>
      item.platform ||
      item.capacityType ||
      item.price !== null ||
      item.discountPercent
  );
}

function buildMedia(file) {
  if (!file) return undefined;

  return {
    alt: String(file.alt || "").trim(),
    blur: file.blur,
    mobile: file.mobile,
    position: file.position,
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
    alt: String(raw.alt || "").trim(),
    blur: raw.blur || undefined,
    mobile: raw.mobile || undefined,
    position: raw.position || undefined,
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
  const description =
    payload.description !== undefined
      ? payload.description
      : currentGame?.description || currentGame?.shortDescription || "";
  const summary =
    payload.summary !== undefined
      ? payload.summary
      : currentGame?.summary || "";

  if (payload.title !== undefined || payload.summary !== undefined || payload.description !== undefined || payload.shortDescription !== undefined || !currentGame) {
    Object.assign(payload, buildGameSeoPayload({ description, seoKeywords: currentGame?.seoKeywords, summary, title }));
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
    description:
      body.description !== undefined
        ? String(body.description).trim()
        : body.shortDescription !== undefined
          ? String(body.shortDescription).trim()
          : undefined,
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
    searchTitles:
      body.searchTitles !== undefined ? parseSearchTitles(body.searchTitles) : undefined,
    filterValues:
      body.filterValues !== undefined ? parseFilterValues(body.filterValues) : undefined,
    collections: body.collections !== undefined ? parseArray(body.collections) : undefined,
    platforms:
      body.platforms !== undefined ? parseObjectIdArray(body.platforms) : undefined,
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
    showOnlyInCollections:
      body.showOnlyInCollections !== undefined ? parseBoolean(body.showOnlyInCollections) : undefined,
    dlcs:
      body.dlcs !== undefined
        ? parseObjectArray(body.dlcs, (item) => ({
            title: typeof item === "string" ? String(item).trim() : String(item?.title || "").trim(),
            type: typeof item === "string" ? "" : String(item?.type || "").trim(),
            versionSize: typeof item === "string" ? null : parseSizeMb(item?.versionSize),
            image: typeof item === "string" ? "" : item?.image || "",
          }))
        : undefined,
    extraEditions:
      body.extraEditions !== undefined
        ? parseObjectArray(body.extraEditions, (item) => ({
            title: typeof item === "string" ? String(item).trim() : String(item?.title || "").trim(),
            versionTitles: typeof item === "string" ? "" : String(item?.versionTitles || "").trim(),
            versionSize: typeof item === "string" ? "" : String(item?.versionSize || "").trim(),
            items: typeof item === "string" ? [] : parseExtraEditionItems(item?.items),
            image: typeof item === "string" ? "" : item?.image || "",
          }))
        : undefined,
    platformSizes:
      body.platformSizes !== undefined
        ? parseObjectArray(body.platformSizes, (item) => ({
            platform: normalizeSubmittedObjectId(item?.platform),
            variant: String(item?.variant || "").trim(),
            size: parseSizeMb(item?.size),
          }))
        : undefined,
    platformDownloadLinks:
      body.platformDownloadLinks !== undefined
        ? parseObjectArray(body.platformDownloadLinks, (item) => ({
            platform: normalizeSubmittedObjectId(item?.platform),
            platformTitle: String(item?.platformTitle || "").trim(),
            platformDescription: String(item?.platformDescription || "").trim(),
            titleId: String(item?.titleId || item?.gameTitle || "").trim().toUpperCase(),
            region: String(item?.region || "").trim().toUpperCase(),
            regionDescription: String(item?.regionDescription || "").trim(),
            version: String(item?.version || "").trim(),
            size: parseSizeMb(item?.size),
            downloadUrl: String(item?.downloadUrl || item?.url || item?.link || "").trim(),
            sourceUrl: String(item?.sourceUrl || "").trim(),
            notes: String(item?.notes || "").trim(),
            parts: normalizeDownloadParts(item?.parts),
          }))
        : undefined,
    platformReleases:
      body.platformReleases !== undefined
        ? parseObjectArray(body.platformReleases, (item) => ({
            platform: normalizeSubmittedObjectId(item?.platform),
            releaseDate: parseDateValue(item?.releaseDate),
          }))
        : undefined,
    releaseDate:
      body.releaseDate !== undefined
        ? parseDateValue(body.releaseDate)
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
      body.sonyScore !== undefined ? normalizeSubmittedStoreScore5(body.sonyScore) : undefined,
    steamScore:
      body.steamScore !== undefined ? normalizeSubmittedStoreScore5(body.steamScore) : undefined,
    xboxScore:
      body.xboxScore !== undefined ? normalizeSubmittedStoreScore5(body.xboxScore) : undefined,
    starRating:
      body.starRating !== undefined ? parseStarRatingValue(body.starRating) : undefined,
    steamRating:
      body.steamRating !== undefined ? parseStarRatingValue(body.steamRating) : undefined,
    xboxRating:
      body.xboxRating !== undefined ? parseStarRatingValue(body.xboxRating) : undefined,
    playstationTitleId:
      body.playstationTitleId !== undefined ? normalizePlayStationTitleId(body.playstationTitleId) : undefined,
    playstationNpCommunicationId:
      body.playstationNpCommunicationId !== undefined ? normalizeNpCommunicationId(body.playstationNpCommunicationId) : undefined,
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
  if (payload.platformDownloadLinks !== undefined) {
    await ensureExists(
      Platform,
      payload.platformDownloadLinks.map((item) => item.platform).filter(Boolean),
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
  const playstationTitleId = normalizePlayStationTitleId(req.body?.playstationTitleId || req.body?.titleId || req.query?.playstationTitleId);
  const source = String(req.body?.source || "").trim().toLowerCase();

  if (!text && !title && !playstationTitleId) {
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
        storeData = await fetchPlayStationIntro(title, playstationTitleId);
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
        starRating: storeData?.starRating ?? null,
        platformReleases: storeData?.platformReleases || [],
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

exports.importPsxHubDownloads = async (req, res) => {
  const title = String(req.body?.title || req.query?.title || "").trim();

  if (!title) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "عنوان بازی برای دریافت لینک‌های دانلود الزامی است",
    });
  }

  try {
    const data = await fetchPsxHubDownloads(title);

    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: data.downloads.length
        ? "اطلاعات دانلود از PSXHub دریافت شد"
        : "برای این عنوان اطلاعات دانلودی پیدا نشد",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 502).json({
      acknowledgement: false,
      message: "PSXHub Import Failed",
      description: "دریافت اطلاعات دانلود از PSXHub انجام نشد",
    });
  }
};

exports.fetchXboxAchievements = async (req, res) => {
  const title = String(req.body?.title || req.query?.title || "").trim();
  const titleId = String(req.body?.titleId || req.body?.xboxTitleId || req.query?.titleId || "").trim();

  if (!title && !titleId) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "عنوان بازی برای دریافت تروفی‌های Xbox الزامی است",
    });
  }

  try {
    const data = await fetchXboxAchievements(title, titleId);
    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "تروفی‌های Xbox دریافت شد",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 502).json({
      acknowledgement: false,
      message: "Xbox Achievements Failed",
      description: getXboxAchievementErrorDescription(error),
    });

    res.status(error.statusCode || 502).json({
      acknowledgement: false,
      message: "Xbox Achievements Failed",
      description:
        error.statusCode === 424
          ? "توکن Xbox Live روی سرور تنظیم نشده است"
          : "دریافت تروفی‌های Xbox انجام نشد",
    });
  }
};

exports.fetchPlayStationTrophies = async (req, res) => {
  const title = String(req.body?.title || req.query?.title || "").trim();
  const npCommunicationId = normalizeNpCommunicationId(req.body?.npCommunicationId || req.body?.playstationNpCommunicationId || req.query?.npCommunicationId);

  if (!title && !npCommunicationId) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "عنوان بازی یا NP Communication ID برای دریافت تروفی‌های PlayStation الزامی است",
    });
  }

  try {
    const data = await fetchPlayStationTrophies(title, npCommunicationId);
    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "تروفی‌های PlayStation دریافت شد",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 502).json({
      acknowledgement: false,
      message: "PlayStation Trophies Failed",
      description: getPlayStationTrophyErrorDescription(error),
    });

    res.status(error.statusCode || 502).json({
      acknowledgement: false,
      message: "PlayStation Trophies Failed",
      description:
        error.statusCode === 424
          ? "توکن NPSSO پلی‌استیشن روی سرور تنظیم نشده است"
          : error.statusCode === 404
            ? "این بازی در لیست تروفی‌های اکانت PlayStation پیدا نشد؛ NP Communication ID را دستی وارد کنید"
            : "دریافت تروفی‌های PlayStation انجام نشد",
    });
  }
};

exports.suggestGames = async (req, res) => {
  const query = String(req.query.q || req.query.search || "").trim();
  const titleId = normalizePlayStationTitleId(req.query.titleId || req.query.playstationTitleId);

  if (query.length < 2 && titleId.length < 2) {
    return res.status(200).json({
      acknowledgement: true,
      data: [],
      description: "حداقل دو کاراکتر برای پیشنهاد عنوان لازم است",
      message: "Game Suggestions",
    });
  }

  const settled = await Promise.allSettled(
    titleId
      ? [suggestPlayStationGames(query, titleId)]
      : [
          suggestXboxGames(query),
          suggestPlayStationGames(query, titleId),
          suggestSteamGames(query),
        ]
  );
  const groups = settled.map((result) => (result.status === "fulfilled" ? result.value : []));
  const data = mergeGameSuggestions(groups, 12);

  return res.status(200).json({
    acknowledgement: true,
    data,
    description: data.length ? "پیشنهادهای عنوان بازی دریافت شد" : "پیشنهادی برای این عنوان پیدا نشد",
    message: "Game Suggestions",
  });
};

exports.suggestPlayStationGallery = async (req, res) => {
  const query = String(req.query.q || req.query.search || "").trim();
  const titleId = normalizePlayStationTitleId(req.query.titleId || req.query.playstationTitleId);

  if (query.length < 2 && titleId.length < 2) {
    return res.status(200).json({
      acknowledgement: true,
      data: [],
      description: "At least two characters are required for gallery suggestions",
      message: "PlayStation Gallery Suggestions",
    });
  }

  const data = await suggestPlayStationGalleryImages(query, titleId);

  return res.status(200).json({
    acknowledgement: true,
    data,
    description: data.length ? "PlayStation gallery suggestions fetched" : "No PlayStation gallery images found",
    message: "PlayStation Gallery Suggestions",
  });
};

exports.createGame = async (req, res) => {
  const payload = normalizePayload(req.body, req.uploadedFiles);
  payload.creator = req.admin?._id || null;
  payload.status = isPrivilegedAdmin(req.admin) ? "active" : "pending";
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
  await applyDynamicGameTags(payload, null, req.admin?._id || null);

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
    ...(req.adminRecord ? {} : { status: "active", showOnlyInCollections: { $ne: true } }),
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
  const identityFilter = gameIdentityFilter(id);

  if (!identityFilter) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه بازی معتبر نیست",
    });
  }

  const game = await populateGame(
    Game.findOne({
      ...identityFilter,
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
  const identityFilter = gameIdentityFilter(id);

  if (!identityFilter) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه بازی معتبر نیست",
    });
  }

  const game = await Game.findOne({ ...identityFilter, isDeleted: false });
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
    payload.slug = await makeUniqueSlug(payload.slug || payload.title || game.title, game._id);
  }
  await applyDynamicGameTags(payload, game, req.admin?._id || null);
  await validatePayload(payload);
  Object.assign(game, payload);
  if (payload.description !== undefined) {
    game.shortDescription = undefined;
  }
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
  const identityFilter = gameIdentityFilter(id);

  if (!identityFilter) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه بازی معتبر نیست",
    });
  }

  const game = await Game.findOneAndUpdate(
    { ...identityFilter, isDeleted: false },
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
    { "games.game": game._id },
    { $pull: { games: { game: game._id } } }
  );

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "بازی با موفقیت حذف شد",
  });
};
