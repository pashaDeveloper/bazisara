const mongoose = require("mongoose");
const GameKeyword = require("../models/gameKeyword.model");
const {
  buildSearchQuery,
  buildPaginationMeta,
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

function normalizePayload(body, uploadedFiles) {
  const name = body.name !== undefined ? String(body.name).trim() : undefined;
  const titleEn = body.title_en !== undefined ? String(body.title_en).trim() : undefined;
  const slugSource = body.slug !== undefined ? body.slug : titleEn || name;
  const payload = {
    name,
    title_en: titleEn,
    slug: slugSource !== undefined ? makeSlug(slugSource) : undefined,
    description: body.description !== undefined ? String(body.description).trim() : undefined,
  };

  if (uploadedFiles?.image?.[0]) {
    payload.image = {
      url: uploadedFiles.image[0].url,
      public_id: uploadedFiles.image[0].public_id,
      storage: uploadedFiles.image[0].storage || "",
    };
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

async function slugExists(slug, currentId = null) {
  if (!slug) return false;
  return GameKeyword.exists({
    slug,
    isDeleted: false,
    ...(currentId ? { _id: { $ne: currentId } } : {}),
  });
}

exports.createKeyword = async (req, res) => {
  const payload = normalizePayload(req.body || {}, req.uploadedFiles);
  if (!payload.name) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "عنوان کلمه کلیدی الزامی است" });
  }
  if (!payload.slug) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "اسلاگ کلمه کلیدی الزامی است" });
  }
  if (await slugExists(payload.slug)) {
    return res.status(409).json({ acknowledgement: false, message: "Conflict", description: "این اسلاگ قبلا ثبت شده است" });
  }

  payload.creator = req.admin?._id || null;
  const keyword = await GameKeyword.create(payload);
  res.status(201).json({ acknowledgement: true, message: "Created", description: "کلمه کلیدی بازی ذخیره شد", data: keyword });
};

exports.getKeywords = async (req, res) => {
  const search = getSearchTerm(req.query);
  const query = {
    isDeleted: false,
    ...buildSearchQuery(search, ["name", "title_en", "slug", "description"]),
  };
  const { limit, page, skip } = getPaginationOptions(req.query);
  const [items, totalItems] = await Promise.all([
    GameKeyword.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    GameKeyword.countDocuments(query),
  ]);
  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست کلمات کلیدی بازی دریافت شد",
    data: items,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getKeyword = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه کلمه کلیدی معتبر نیست" });
  }
  const keyword = await GameKeyword.findOne({ _id: id, isDeleted: false });
  if (!keyword) {
    return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "کلمه کلیدی پیدا نشد" });
  }
  res.status(200).json({ acknowledgement: true, message: "OK", data: keyword });
};

exports.updateKeyword = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه کلمه کلیدی معتبر نیست" });
  }
  const keyword = await GameKeyword.findOne({ _id: id, isDeleted: false });
  if (!keyword) {
    return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "کلمه کلیدی پیدا نشد" });
  }

  const payload = normalizePayload(req.body || {}, req.uploadedFiles);
  if (payload.slug && (await slugExists(payload.slug, id))) {
    return res.status(409).json({ acknowledgement: false, message: "Conflict", description: "این اسلاگ قبلا ثبت شده است" });
  }

  Object.assign(keyword, payload);
  await keyword.save();
  res.status(200).json({ acknowledgement: true, message: "OK", description: "کلمه کلیدی بازی به‌روزرسانی شد", data: keyword });
};

exports.deleteKeyword = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه کلمه کلیدی معتبر نیست" });
  }
  const keyword = await GameKeyword.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );
  if (!keyword) {
    return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "کلمه کلیدی پیدا نشد" });
  }
  res.status(200).json({ acknowledgement: true, message: "OK", description: "کلمه کلیدی بازی حذف شد" });
};
