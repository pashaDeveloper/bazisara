const mongoose = require("mongoose");
const Tag = require("../models/tag.model");
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

function normalizeKeywords(value) {
  if (value === undefined) return undefined;

  let keywords = value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      keywords = Array.isArray(parsed) ? parsed : value;
    } catch (_) {
      keywords = value;
    }
  }

  if (!Array.isArray(keywords)) {
    keywords = String(keywords || "").split(",");
  }

  return keywords
    .map((keyword) => String(keyword || "").trim())
    .filter(Boolean);
}

function normalizeTagPayload(body, uploadedFiles) {
  const name = body.name !== undefined ? String(body.name).trim() : undefined;
  const slugSource = body.slug !== undefined ? body.slug : name;
  const payload = {
    name,
    slug: slugSource !== undefined ? makeSlug(slugSource) : undefined,
    description:
      body.description !== undefined ? String(body.description).trim() : undefined,
    seoTitle: body.seoTitle !== undefined ? String(body.seoTitle).trim() : undefined,
    seoDescription:
      body.seoDescription !== undefined
        ? String(body.seoDescription).trim()
        : undefined,
    seoKeywords: normalizeKeywords(body.seoKeywords),
  };

  if (uploadedFiles?.image?.[0]) {
    payload.image = {
      url: uploadedFiles.image[0].url,
      public_id: uploadedFiles.image[0].public_id,
      storage: uploadedFiles.image[0].storage || "",
    };
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

async function tagSlugExists(slug, currentId = null) {
  if (!slug) return false;

  return Tag.exists({
    slug,
    isDeleted: false,
    ...(currentId ? { _id: { $ne: currentId } } : {}),
  });
}

exports.createTag = async (req, res) => {
  const payload = normalizeTagPayload(req.body, req.uploadedFiles);

  if (!payload.name) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "نام تگ الزامی است",
    });
  }

  if (!payload.slug) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "اسلاگ تگ الزامی است",
    });
  }

  if (await tagSlugExists(payload.slug)) {
    return res.status(409).json({
      acknowledgement: false,
      message: "Conflict",
      description: "این اسلاگ قبلا برای تگ دیگری ثبت شده است",
    });
  }

  payload.creator = req.admin?._id || null;
  const tag = await Tag.create(payload);

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "تگ با موفقیت ایجاد شد",
    data: tag,
  });
};

exports.getTags = async (req, res) => {
  const search = getSearchTerm(req.query);
  const query = {
    isDeleted: false,
    ...buildSearchQuery(search, [
      "name",
      "slug",
      "description",
      "seoTitle",
      "seoDescription",
      "seoKeywords",
    ]),
  };
  const { limit, page, skip } = getPaginationOptions(req.query);
  const [tags, totalItems] = await Promise.all([
    Tag.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Tag.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست تگ‌ها دریافت شد",
    data: tags,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getTag = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه تگ معتبر نیست",
    });
  }

  const tag = await Tag.findOne({ _id: id, isDeleted: false });

  if (!tag) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "تگ یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "جزئیات تگ دریافت شد",
    data: tag,
  });
};

exports.updateTag = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه تگ معتبر نیست",
    });
  }

  const tag = await Tag.findOne({ _id: id, isDeleted: false });
  if (!tag) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "تگ یافت نشد",
    });
  }

  const payload = normalizeTagPayload(req.body, req.uploadedFiles);

  if (payload.slug && (await tagSlugExists(payload.slug, id))) {
    return res.status(409).json({
      acknowledgement: false,
      message: "Conflict",
      description: "این اسلاگ قبلا برای تگ دیگری ثبت شده است",
    });
  }

  Object.assign(tag, payload);
  await tag.save();

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "تگ با موفقیت به‌روزرسانی شد",
    data: tag,
  });
};

exports.deleteTag = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه تگ معتبر نیست",
    });
  }

  const tag = await Tag.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!tag) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "تگ یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "تگ با موفقیت حذف شد",
  });
};
