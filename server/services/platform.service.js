const mongoose = require("mongoose");
const Platform = require("../models/platform.model");
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

function normalizeDate(value) {
  if (value === undefined) return undefined;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildTree(items, parentId = null) {
  return items
    .filter((item) => String(item.parent?._id || item.parent || "") === String(parentId || ""))
    .map((item) => ({
      ...item.toObject(),
      children: buildTree(items, item._id),
    }));
}

async function ensureParent(parent, currentId = null) {
  if (!parent) return null;
  if (!mongoose.Types.ObjectId.isValid(parent)) throw new Error("Parent platform id is not valid");
  if (currentId && String(parent) === String(currentId)) throw new Error("Platform cannot be parent of itself");
  const item = await Platform.findOne({ _id: parent, isDeleted: false });
  if (!item) throw new Error("Parent platform not found");
  return parent;
}

async function slugExists(slug, currentId = null) {
  return Platform.exists({
    slug,
    isDeleted: false,
    ...(currentId ? { _id: { $ne: currentId } } : {}),
  });
}

function populatePlatform(query) {
  return query.populate("parent", "name slug");
}

exports.createPlatform = async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const slug = makeSlug(req.body?.slug || name);

  if (!name || !slug) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "نام و اسلاگ پلتفرم الزامی است",
    });
  }

  if (await slugExists(slug)) {
    return res.status(409).json({
      acknowledgement: false,
      message: "Conflict",
      description: "این اسلاگ قبلا برای پلتفرم دیگری ثبت شده است",
    });
  }

  const parent = await ensureParent(req.body?.parent);
  const platform = await Platform.create({
    name,
    slug,
    parent,
    description: String(req.body?.description || "").trim(),
    productionDate: normalizeDate(req.body?.productionDate),
    creator: req.admin?._id || null,
  });

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "پلتفرم با موفقیت ایجاد شد",
    data: await populatePlatform(Platform.findById(platform._id)),
  });
};

exports.getPlatforms = async (req, res) => {
  const search = getSearchTerm(req.query);
  const asTree = String(req.query.tree || "") === "true";
  const query = {
    isDeleted: false,
    ...buildSearchQuery(search, ["name", "slug", "description"]),
  };

  if (asTree) {
    const platforms = await populatePlatform(Platform.find(query).sort({ parent: 1, createdAt: -1 }));
    return res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "درخت پلتفرم‌ها دریافت شد",
      data: buildTree(platforms),
    });
  }

  const { limit, page, skip } = getPaginationOptions(req.query);
  const [platforms, totalItems] = await Promise.all([
    populatePlatform(Platform.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Platform.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست پلتفرم‌ها دریافت شد",
    data: platforms,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getPlatform = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه پلتفرم معتبر نیست",
    });
  }

  const platform = await populatePlatform(Platform.findOne({ _id: id, isDeleted: false }));
  if (!platform) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "پلتفرم یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "جزئیات پلتفرم دریافت شد",
    data: platform,
  });
};

exports.updatePlatform = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه پلتفرم معتبر نیست",
    });
  }

  const platform = await Platform.findOne({ _id: id, isDeleted: false });
  if (!platform) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "پلتفرم یافت نشد",
    });
  }

  const slug = req.body?.slug !== undefined ? makeSlug(req.body.slug) : undefined;
  if (slug && (await slugExists(slug, id))) {
    return res.status(409).json({
      acknowledgement: false,
      message: "Conflict",
      description: "این اسلاگ قبلا برای پلتفرم دیگری ثبت شده است",
    });
  }

  if (req.body?.name !== undefined) platform.name = String(req.body.name).trim();
  if (slug !== undefined) platform.slug = slug || makeSlug(platform.name);
  if (req.body?.parent !== undefined) platform.parent = await ensureParent(req.body.parent, id);
  if (req.body?.description !== undefined) platform.description = String(req.body.description || "").trim();
  if (req.body?.productionDate !== undefined) platform.productionDate = normalizeDate(req.body.productionDate);

  await platform.save();

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "پلتفرم با موفقیت به‌روزرسانی شد",
    data: await populatePlatform(Platform.findById(platform._id)),
  });
};

exports.deletePlatform = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه پلتفرم معتبر نیست",
    });
  }

  const hasChildren = await Platform.exists({ parent: id, isDeleted: false });
  if (hasChildren) {
    return res.status(409).json({
      acknowledgement: false,
      message: "Conflict",
      description: "ابتدا زیرمجموعه‌های این پلتفرم را حذف یا جابه‌جا کنید",
    });
  }

  const platform = await Platform.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!platform) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "پلتفرم یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "پلتفرم با موفقیت حذف شد",
  });
};
