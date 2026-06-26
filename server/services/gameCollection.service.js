const mongoose = require("mongoose");
const Game = require("../models/game.model");
const GameCollection = require("../models/gameCollection.model");
const {
  buildPaginationMeta,
  buildSearchQuery,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

function makeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseBoolean(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function parseGames(value) {
  if (value === undefined || value === null || value === "") return [];
  const rawItems = Array.isArray(value)
    ? value
    : (() => {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
          return String(value).split(",").filter(Boolean);
        }
      })();

  return rawItems
    .map((item, index) => {
      const game = typeof item === "string" ? item : item?.game || item?._id || item?.id;
      return {
        game,
        sortOrder: Number(item?.sortOrder ?? index),
        visible: item?.visible === undefined ? true : parseBoolean(item.visible),
      };
    })
    .filter((item) => item.game);
}

const populateCollection = (query) =>
  query.populate("games.game", "title slug cover cardDesktopCover status");

async function ensureGames(items) {
  const ids = items.map((item) => item.game).filter(Boolean);
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Game id is not valid");
  }
  if (!ids.length) return;
  const count = await Game.countDocuments({ _id: { $in: ids }, isDeleted: false });
  if (count !== ids.length) throw new Error("Game not found");
}

async function syncGameMembership(collectionId, previousGameIds = [], nextItems = []) {
  const nextGameIds = nextItems.filter((item) => item.visible).map((item) => item.game);
  if (previousGameIds.length) {
    await Game.updateMany({ _id: { $in: previousGameIds } }, { $pull: { collections: collectionId } });
  }
  if (nextGameIds.length) {
    await Game.updateMany({ _id: { $in: nextGameIds } }, { $addToSet: { collections: collectionId } });
  }
}

function normalizePayload(body, adminId) {
  const titleFa = body.title_fa !== undefined ? String(body.title_fa).trim() : undefined;
  const titleEn = body.title_en !== undefined ? String(body.title_en).trim() : undefined;
  const slugSource = body.slug || titleEn || titleFa;
  return Object.fromEntries(
    Object.entries({
      title_fa: titleFa,
      title_en: titleEn,
      slug: slugSource !== undefined ? makeSlug(slugSource) : undefined,
      description: body.description !== undefined ? String(body.description).trim() : undefined,
      placement: body.placement !== undefined ? String(body.placement || "homepage").trim() : undefined,
      order: body.order !== undefined && body.order !== "" ? Number(body.order) : undefined,
      games: body.games !== undefined ? parseGames(body.games) : undefined,
      visibility: body.visibility !== undefined ? parseBoolean(body.visibility) : undefined,
      creator: adminId || undefined,
    }).filter(([, value]) => value !== undefined)
  );
}

function getUploadedImage(req) {
  const file = req.uploadedFiles?.image?.[0];
  if (!file) return undefined;

  return {
    url: file.url,
    public_id: file.public_id,
    storage: file.storage || "",
  };
}

exports.createCollection = async (req, res) => {
  const payload = normalizePayload(req.body || {}, req.admin?._id);
  const image = getUploadedImage(req);
  if (image) payload.image = image;
  if (!payload.title_fa || !payload.slug) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "عنوان و اسلاگ کالکشن الزامی است" });
  }
  await ensureGames(payload.games || []);
  if (payload.order === undefined) {
    const lastCollection = await GameCollection.findOne({ isDeleted: false })
      .sort({ order: -1, createdAt: -1 })
      .select("order");
    payload.order = Number(lastCollection?.order || 0) + 1;
  }
  const collection = await GameCollection.create(payload);
  await syncGameMembership(collection._id, [], payload.games || []);
  const populated = await populateCollection(GameCollection.findById(collection._id));
  res.status(201).json({ acknowledgement: true, message: "Created", description: "کالکشن بازی ذخیره شد", data: populated });
};

exports.getCollections = async (req, res) => {
  const search = getSearchTerm(req.query);
  const { limit, page, skip } = getPaginationOptions(req.query);
  const query = {
    isDeleted: false,
    ...(req.adminRecord ? {} : { status: "active", visibility: true }),
    ...buildSearchQuery(search, ["title_fa", "title_en", "slug", "description", "placement"]),
  };
  const [items, totalItems] = await Promise.all([
    populateCollection(GameCollection.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit)),
    GameCollection.countDocuments(query),
  ]);
  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    data: items,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getCollection = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه کالکشن معتبر نیست" });
  }
  const item = await populateCollection(GameCollection.findOne({ _id: req.params.id, isDeleted: false }));
  if (!item) return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "کالکشن پیدا نشد" });
  res.status(200).json({ acknowledgement: true, message: "OK", data: item });
};

exports.updateCollection = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه کالکشن معتبر نیست" });
  }
  const collection = await GameCollection.findOne({ _id: req.params.id, isDeleted: false });
  if (!collection) return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "کالکشن پیدا نشد" });

  const previousGameIds = collection.games.map((item) => item.game).filter(Boolean);
  const payload = normalizePayload(req.body || {}, req.admin?._id);
  const image = getUploadedImage(req);
  if (image) payload.image = image;
  if (payload.games !== undefined) await ensureGames(payload.games);
  Object.assign(collection, payload);
  await collection.save();
  if (payload.games !== undefined) await syncGameMembership(collection._id, previousGameIds, payload.games);

  const populated = await populateCollection(GameCollection.findById(collection._id));
  res.status(200).json({ acknowledgement: true, message: "OK", description: "کالکشن بازی به‌روزرسانی شد", data: populated });
};

exports.updateCollectionVisibility = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه کالکشن معتبر نیست" });
  }
  const visibility = parseBoolean(req.body?.visibility);
  const collection = await GameCollection.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { visibility },
    { new: true }
  );
  if (!collection) return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "کالکشن پیدا نشد" });
  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "وضعیت نمایش کالکشن به‌روزرسانی شد",
    data: await populateCollection(GameCollection.findById(collection._id)),
  });
};

exports.reorderCollections = async (req, res) => {
  const collections = Array.isArray(req.body?.collections) ? req.body.collections : [];
  if (!collections.length) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "لیست ترتیب کالکشن‌ها خالی است" });
  }
  const invalidItem = collections.find((item) => !mongoose.Types.ObjectId.isValid(item?._id));
  if (invalidItem) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه کالکشن معتبر نیست" });
  }
  await GameCollection.bulkWrite(
    collections.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id, isDeleted: false },
        update: {
          $set: {
            order: Number.isFinite(Number(item.order)) ? Number(item.order) : index + 1,
          },
        },
      },
    }))
  );
  const updated = await populateCollection(GameCollection.find({ isDeleted: false }).sort({ order: 1, createdAt: -1 }));
  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "ترتیب کالکشن‌ها به‌روزرسانی شد",
    data: updated,
  });
};

exports.deleteCollection = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه کالکشن معتبر نیست" });
  }
  const collection = await GameCollection.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), status: "inactive" },
    { new: true }
  );
  if (!collection) return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "کالکشن پیدا نشد" });
  await Game.updateMany({ collections: collection._id }, { $pull: { collections: collection._id } });
  res.status(200).json({ acknowledgement: true, message: "OK", description: "کالکشن بازی حذف شد" });
};
