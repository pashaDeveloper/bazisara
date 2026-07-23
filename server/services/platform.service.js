const mongoose = require("mongoose");
const Platform = require("../models/platform.model");
const Brand = require("../models/brand.model");
const {
  buildPaginationMeta,
  buildSearchQuery,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");
const { mediaFromUploadOrBody } = require("../utils/media.util");

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

function normalizeSvg(value) {
  const svg = String(value || "").trim();
  if (!svg) return "";
  if (!/^<svg[\s>][\s\S]*<\/svg>$/i.test(svg)) {
    throw new Error("Platform SVG must be valid SVG markup");
  }
  return svg;
}

function buildUploadedFile(uploadedFiles = {}, fieldName) {
  const file = uploadedFiles[fieldName]?.[0];
  if (!file) return null;
  return {
    blur: file.blur,
    url: file.url || file.path || "",
    public_id: file.public_id || file.key || file.filename || "",
    format: file.format || "",
  };
}

function buildImage(uploadedFiles = {}, bodyValue) {
  const image = mediaFromUploadOrBody(uploadedFiles, "image", bodyValue);
  if (!image) return null;
  return {
    blur: image.blur,
    url: image.url,
    public_id: image.public_id,
    storage: image.storage || "",
  };
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

async function ensureBrand(brand) {
  const value = Array.isArray(brand) ? brand[0] : brand;
  if (!value) return null;
  if (!mongoose.Types.ObjectId.isValid(value)) throw new Error("Brand id is not valid");
  const item = await Brand.findOne({ _id: value, isDeleted: false });
  if (!item) throw new Error("Brand not found");
  return value;
}

async function slugExists(slug, currentId = null) {
  return Platform.exists({
    slug,
    isDeleted: false,
    ...(currentId ? { _id: { $ne: currentId } } : {}),
  });
}

function populatePlatform(query) {
  return query
    .populate("parent", "name name_fa name_en slug")
    .populate("brand", "title_fa title_en logo brandId code");
}

exports.createPlatform = async (req, res) => {
  const nameFa = String(req.body?.name_fa || req.body?.name || "").trim();
  const nameEn = String(req.body?.name_en || "").trim();
  const slug = makeSlug(req.body?.slug || nameEn);

  if (!nameFa || !nameEn || !slug) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "نام فارسی، نام انگلیسی و اسلاگ پلتفرم الزامی است",
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
  const brand = await ensureBrand(req.body?.brand ?? req.body?.brands);
  if (!brand) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "برند پلتفرم الزامی است",
    });
  }
  const image = buildImage(req.uploadedFiles, req.body.image);
  const fontFile = buildUploadedFile(req.uploadedFiles, "fontFile");

  const platform = await Platform.create({
    name_fa: nameFa,
    name_en: nameEn,
    name: nameFa,
    slug,
    parent,
    brand,
    description: String(req.body?.description || "").trim(),
    productionDate: normalizeDate(req.body?.productionDate),
    ...(image?.url ? { image } : {}),
    ...(fontFile?.url ? { fontFile } : {}),
    svgIcon: normalizeSvg(req.body?.svgIcon),
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
    ...buildSearchQuery(search, ["name_fa", "name_en", "name", "slug", "description"]),
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

  if (req.body?.name_fa !== undefined || req.body?.name !== undefined) {
    platform.name_fa = String(req.body.name_fa || req.body.name || "").trim();
    platform.name = platform.name_fa;
  }
  if (req.body?.name_en !== undefined) platform.name_en = String(req.body.name_en || "").trim();
  if (!platform.name_fa && platform.name) platform.name_fa = platform.name;
  if (!platform.name_en && platform.slug) platform.name_en = platform.slug;
  if (slug !== undefined) platform.slug = slug || makeSlug(platform.name_en);
  if (!platform.slug) platform.slug = makeSlug(platform.name_en);
  if (req.body?.parent !== undefined) platform.parent = await ensureParent(req.body.parent, id);
  if (req.body?.brand !== undefined || req.body?.brands !== undefined) {
    platform.brand = await ensureBrand(req.body.brand ?? req.body.brands);
  }
  if (!platform.brand) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "برند پلتفرم الزامی است",
    });
  }
  if (req.body?.description !== undefined) platform.description = String(req.body.description || "").trim();
  if (req.body?.productionDate !== undefined) platform.productionDate = normalizeDate(req.body.productionDate);
  if (!platform.name_fa || !platform.name_en || !platform.slug) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "نام فارسی، نام انگلیسی و اسلاگ پلتفرم الزامی است",
    });
  }
  const image = buildImage(req.uploadedFiles, req.body.image);
  if (image?.url) platform.image = image;
  const fontFile = buildUploadedFile(req.uploadedFiles, "fontFile");
  if (fontFile?.url) platform.fontFile = fontFile;
  if (req.body?.svgIcon !== undefined) platform.svgIcon = normalizeSvg(req.body.svgIcon);

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
