const mongoose = require("mongoose");
const Game = require("../models/game.model");
const Category = require("../models/category.model");
const Genre = require("../models/genre.model");
const Platform = require("../models/platform.model");
const Company = require("../models/company.model");
const Tag = require("../models/tag.model");
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
    .populate("platforms", "name slug parent")
    .populate("platformSizes.platform", "name slug parent")
    .populate("developers", "name logo icon")
    .populate("publishers", "name logo icon")
    .populate("tags", "name slug image");

function makeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

function normalizeStructuredImages(items, uploadedFiles, fieldName) {
  if (!Array.isArray(items)) return [];
  const files = Array.isArray(uploadedFiles?.[fieldName]) ? uploadedFiles[fieldName] : [];
  let fileIndex = 0;

  return items.map((item) => {
    const hasImageUrl = typeof item.image === "string" && item.image.trim();
    if (!hasImageUrl && fileIndex < files.length) {
      const image = buildMedia(files[fileIndex]);
      fileIndex += 1;
      return { ...item, image };
    }

    return hasImageUrl
      ? { ...item, image: { url: item.image.trim(), public_id: "", type: "image" } }
      : { ...item, image: undefined };
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
    storage: file.storage || "",
    type: file.resource_type === "video" ? "video" : "image",
  };
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

  if (payload.title !== undefined || payload.shortDescription !== undefined || !currentGame) {
    payload.seoTitle = limitText(title, 160);
    payload.seoDescription = limitText(shortDescription || title, 320);
    payload.seoKeywords = [title, shortDescription]
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
  const payload = {
    title,
    slug: title !== undefined ? "" : undefined,
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
    developers:
      body.developers !== undefined ? parseArray(body.developers) : undefined,
    publishers:
      body.publishers !== undefined ? parseArray(body.publishers) : undefined,
    tags: body.tags !== undefined ? parseArray(body.tags) : undefined,
    platforms:
      body.platforms !== undefined ? parseArray(body.platforms) : undefined,
    gameModes:
      body.gameModes !== undefined ? parseArray(body.gameModes) : undefined,
    languages:
      body.languages !== undefined ? parseArray(body.languages) : undefined,
    regions: body.regions !== undefined ? parseArray(body.regions) : undefined,
    launcher: body.launcher !== undefined ? parseArray(body.launcher) : undefined,
    edition: body.edition !== undefined ? String(body.edition).trim() : undefined,
    hasDubbing: body.hasDubbing !== undefined ? parseBoolean(body.hasDubbing) : undefined,
    hasSubtitle: body.hasSubtitle !== undefined ? parseBoolean(body.hasSubtitle) : undefined,
    dlcs:
      body.dlcs !== undefined
        ? parseObjectArray(body.dlcs, (item) => ({
            title: typeof item === "string" ? String(item).trim() : String(item?.title || "").trim(),
            type: typeof item === "string" ? "" : String(item?.type || "").trim(),
            versionSize: typeof item === "string" ? "" : String(item?.versionSize || "").trim(),
            image: typeof item === "string" ? "" : String(item?.image || "").trim(),
          }))
        : undefined,
    extraEditions:
      body.extraEditions !== undefined
        ? parseObjectArray(body.extraEditions, (item) => ({
            title: typeof item === "string" ? String(item).trim() : String(item?.title || "").trim(),
            versionSize: typeof item === "string" ? "" : String(item?.versionSize || "").trim(),
            image: typeof item === "string" ? "" : String(item?.image || "").trim(),
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
      body.ageRating !== undefined ? String(body.ageRating).trim() : undefined,
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
    trailerUrl:
      body.trailerUrl !== undefined ? String(body.trailerUrl).trim() : undefined,
    isFeatured:
      body.isFeatured !== undefined ? parseBoolean(body.isFeatured) : undefined,
  };

  const cover = buildMedia(uploadedFiles?.cover?.[0]);
  if (cover) payload.cover = cover;

  const cardDesktopCover = buildMedia(uploadedFiles?.cardDesktopCover?.[0]);
  if (cardDesktopCover) payload.cardDesktopCover = cardDesktopCover;

  const cardMobileCover = buildMedia(uploadedFiles?.cardMobileCover?.[0]);
  if (cardMobileCover) payload.cardMobileCover = cardMobileCover;

  const desktopCover = buildMedia(uploadedFiles?.desktopCover?.[0]);
  if (desktopCover) payload.desktopCover = desktopCover;

  const mobileCover = buildMedia(uploadedFiles?.mobileCover?.[0]);
  if (mobileCover) payload.mobileCover = mobileCover;

  const galleryFiles = uploadedFiles?.gallery || [];
  if (galleryFiles.length) {
    payload.gallery = [
      ...(currentGame?.gallery || []),
      ...galleryFiles.map(buildMedia).filter(Boolean),
    ];
  }

  const trailerVideo = buildMedia(uploadedFiles?.trailerVideo?.[0]);
  if (trailerVideo) payload.trailerVideo = trailerVideo;

  const trailerThumbnail = buildMedia(uploadedFiles?.trailerThumbnail?.[0]);
  if (trailerThumbnail) payload.trailerThumbnail = trailerThumbnail;

  const gameplayVideo = buildMedia(uploadedFiles?.gameplayVideo?.[0]);
  if (gameplayVideo) payload.gameplayVideo = gameplayVideo;

  const gameplayThumbnail = buildMedia(uploadedFiles?.gameplayThumbnail?.[0]);
  if (gameplayThumbnail) payload.gameplayThumbnail = gameplayThumbnail;

  const patchImage = buildMedia(uploadedFiles?.patchImage?.[0]);
  if (patchImage) payload.patchImage = patchImage;

  if (payload.dlcs !== undefined) {
    payload.dlcs = normalizeStructuredImages(payload.dlcs, uploadedFiles, "dlcImages");
  }

  if (payload.extraEditions !== undefined) {
    payload.extraEditions = normalizeStructuredImages(payload.extraEditions, uploadedFiles, "extraEditionImages");
  }

  applySeoFromContent(payload, currentGame);
  payload.status = "pending";

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
}

exports.createGame = async (req, res) => {
  const payload = normalizePayload(req.body, req.uploadedFiles);
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

  payload.slug = await makeUniqueSlug(payload.title);

  await validatePayload(payload);

  const game = await Game.create(payload);
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
  if (payload.title !== undefined) {
    payload.slug = await makeUniqueSlug(payload.title, id);
  }
  await validatePayload(payload);
  Object.assign(game, payload);
  await game.save();

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

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "بازی با موفقیت حذف شد",
  });
};
