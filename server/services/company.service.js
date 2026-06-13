const mongoose = require("mongoose");
const Company = require("../models/company.model");
const Icon = require("../models/icon.model");
const {
  buildSearchQuery,
  buildPaginationMeta,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

async function ensureIconExists(iconId) {
  if (!iconId) return null;

  if (!mongoose.Types.ObjectId.isValid(iconId)) {
    throw new Error("Icon id is not valid");
  }

  const icon = await Icon.findOne({ _id: iconId, isDeleted: false });
  if (!icon) {
    throw new Error("Icon not found");
  }

  return icon;
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

const normalizeCompanyPayload = (body, uploadedFiles) => {
  const payload = {
    name: body.name !== undefined ? String(body.name).trim() : undefined,
    description:
      body.description !== undefined ? String(body.description).trim() : undefined,
    website: body.website !== undefined ? String(body.website).trim() : undefined,
    socialLinks:
      body.socialLinks !== undefined ? parseSocialLinks(body.socialLinks) : undefined,
    country: body.country !== undefined ? String(body.country).trim() : undefined,
    type: body.type || undefined,
    icon: body.icon !== undefined ? body.icon || null : undefined,
  };

  if (body.foundedYear !== undefined) {
    payload.foundedYear = body.foundedYear === "" ? null : Number(body.foundedYear);
  }

  if (uploadedFiles?.logo?.[0]) {
    payload.logo = {
      url: uploadedFiles.logo[0].url,
      public_id: uploadedFiles.logo[0].public_id,
      storage: uploadedFiles.logo[0].storage || "",
    };
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
};

exports.createCompany = async (req, res) => {
  const payload = normalizeCompanyPayload(req.body, req.uploadedFiles);

  if (!payload.name) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "نام کمپانی الزامی است",
    });
  }

  await ensureIconExists(payload.icon);

  payload.creator = req.admin?._id || null;
  const company = await Company.create(payload);
  const populatedCompany = await company.populate("icon", "name svg color");

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "کمپانی با موفقیت ایجاد شد",
    data: populatedCompany,
  });
};

exports.getCompanies = async (req, res) => {
  const search = getSearchTerm(req.query);
  const query = {
    isDeleted: false,
    ...buildSearchQuery(search, ["name", "description", "website", "country"]),
  };
  const { limit, page, skip } = getPaginationOptions(req.query);
  const [companies, totalItems] = await Promise.all([
    Company.find(query)
      .populate("icon", "name svg color")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Company.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست کمپانی‌ها دریافت شد",
    data: companies,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getCompany = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه کمپانی معتبر نیست",
    });
  }

  const company = await Company.findOne({ _id: id, isDeleted: false }).populate(
    "icon",
    "name svg color"
  );

  if (!company) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "کمپانی یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "جزئیات کمپانی دریافت شد",
    data: company,
  });
};

exports.updateCompany = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه کمپانی معتبر نیست",
    });
  }

  const company = await Company.findOne({ _id: id, isDeleted: false });
  if (!company) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "کمپانی یافت نشد",
    });
  }

  const payload = normalizeCompanyPayload(req.body, req.uploadedFiles);
  await ensureIconExists(payload.icon);
  Object.assign(company, payload);
  await company.save();
  const populatedCompany = await company.populate("icon", "name svg color");

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "کمپانی با موفقیت به‌روزرسانی شد",
    data: populatedCompany,
  });
};

exports.deleteCompany = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه کمپانی معتبر نیست",
    });
  }

  const company = await Company.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!company) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "کمپانی یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "کمپانی با موفقیت حذف شد",
  });
};
