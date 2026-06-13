const mongoose = require("mongoose");
const Brand = require("../models/brand.model");
const { generateSlug, normalizePersianSlug } = require("../utils/seoUtils");
const {
  buildPaginationMeta,
  buildSearchQuery,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

function normalizeBrandPayload(body, uploadedFiles) {
  const title = body.title_fa ?? body.name;
  const payload = {
    title_fa: title !== undefined ? String(title).trim() : undefined,
    title_en: body.title_en !== undefined ? String(body.title_en).trim() : undefined,
    website: body.website !== undefined ? String(body.website).trim() : undefined,
    country: body.country !== undefined ? String(body.country).trim() : undefined,
    description: body.description !== undefined ? String(body.description).trim() : undefined,
    visibility: body.visibility !== undefined ? body.visibility === true || body.visibility === "true" || body.visibility === "1" : undefined,
    is_premium: body.is_premium !== undefined ? body.is_premium === true || body.is_premium === "true" || body.is_premium === "1" : undefined,
    is_miscellaneous: body.is_miscellaneous !== undefined ? body.is_miscellaneous === true || body.is_miscellaneous === "true" || body.is_miscellaneous === "1" : undefined,
    is_name_similar: body.is_name_similar !== undefined ? body.is_name_similar === true || body.is_name_similar === "true" || body.is_name_similar === "1" : undefined,
    is_international: body.is_international !== undefined ? body.is_international === true || body.is_international === "true" || body.is_international === "1" : undefined,
  };

  if (body.foundedYear !== undefined) {
    const foundedYear = Number(body.foundedYear);
    payload.foundedYear = Number.isFinite(foundedYear) && body.foundedYear !== "" ? foundedYear : null;
  }

  if (body.rate !== undefined) {
    const rate = Number(body.rate);
    payload.rate = Number.isFinite(rate) ? Math.max(0, Math.min(5, Math.round(rate * 2) / 2)) : 0;
  }

  if (uploadedFiles?.logo?.[0]) {
    payload.logo = {
      url: uploadedFiles.logo[0].url || uploadedFiles.logo[0].path || "",
      public_id: uploadedFiles.logo[0].key || uploadedFiles.logo[0].public_id || uploadedFiles.logo[0].filename || "N/A",
    };
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function makeBrandCode(payload) {
  const source = payload.title_en || payload.title_fa || "brand";
  return generateSlug(source) || normalizePersianSlug(source) || "brand";
}

function decorateBrand(brand) {
  if (!brand) return brand;
  const item = typeof brand.toObject === "function" ? brand.toObject() : { ...brand };
  return {
    ...item,
    name: item.title_fa,
  };
}

exports.createBrand = async (req, res) => {
  const payload = normalizeBrandPayload(req.body, req.uploadedFiles);
  if (!payload.title_fa) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "نام برند الزامی است" });
  }
  payload.code = makeBrandCode(payload);
  payload.creator = req.admin?._id;

  const brand = await Brand.create(payload);
  res.status(201).json({ acknowledgement: true, message: "Created", description: "برند ثبت شد", data: decorateBrand(brand) });
};

exports.getBrands = async (req, res) => {
  const search = getSearchTerm(req.query);
  const { limit, page, skip } = getPaginationOptions(req.query);
  const query = {
    isDeleted: false,
    ...buildSearchQuery(search, ["title_fa", "title_en", "code", "website", "country", "description"]),
  };

  const [brands, totalItems] = await Promise.all([
    Brand.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Brand.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست برندها دریافت شد",
    data: brands.map(decorateBrand),
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getBrand = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه برند معتبر نیست" });
  }

  const brand = await Brand.findOne({ _id: req.params.id, isDeleted: false });
  if (!brand) {
    return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "برند پیدا نشد" });
  }

  res.status(200).json({ acknowledgement: true, message: "OK", data: decorateBrand(brand) });
};

exports.updateBrand = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه برند معتبر نیست" });
  }

  const brand = await Brand.findOne({ _id: req.params.id, isDeleted: false });
  if (!brand) {
    return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "برند پیدا نشد" });
  }

  Object.assign(brand, normalizeBrandPayload(req.body, req.uploadedFiles));
  await brand.save();
  res.status(200).json({ acknowledgement: true, message: "OK", description: "برند به‌روزرسانی شد", data: decorateBrand(brand) });
};

exports.deleteBrand = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه برند معتبر نیست" });
  }

  const brand = await Brand.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), status: "inactive" },
    { new: true }
  );
  if (!brand) {
    return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "برند پیدا نشد" });
  }
  res.status(200).json({ acknowledgement: true, message: "OK", description: "برند حذف شد" });
};
