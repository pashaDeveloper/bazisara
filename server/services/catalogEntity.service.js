const mongoose = require("mongoose");
const {
  buildPaginationMeta,
  buildSearchQuery,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

function parseArray(value) {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_) {}
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function parseBoolean(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function parseNumber(value, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function setNested(payload, path, value) {
  const parts = path.split(".");
  let target = payload;
  parts.slice(0, -1).forEach((part) => {
    target[part] = target[part] || {};
    target = target[part];
  });
  target[parts[parts.length - 1]] = value;
}

function normalizePayload(body, fields, uploadedFiles, adminId) {
  const payload = {};

  fields.forEach((field) => {
    const raw = body[field.name];
    if (raw === undefined) return;

    let value = raw;
    if (field.type === "number") value = parseNumber(raw, field.nullable ? null : 0);
    if (field.type === "boolean") value = parseBoolean(raw);
    if (field.type === "array") value = parseArray(raw).map(String);
    if (field.type === "string") value = String(raw || "").trim();
    setNested(payload, field.path || field.name, value);
  });

  if (uploadedFiles?.logo?.[0]) {
    payload.logo = {
      url: uploadedFiles.logo[0].url || uploadedFiles.logo[0].path || "",
      public_id: uploadedFiles.logo[0].key || uploadedFiles.logo[0].public_id || uploadedFiles.logo[0].filename || "N/A",
    };
  }

  if (adminId) payload.creator = adminId;

  return payload;
}

function createCatalogEntityService({
  Model,
  entityLabel,
  fields,
  populate = "",
  required = [],
  searchFields = [],
}) {
  const applyPopulate = (query) => (populate ? query.populate(populate) : query);

  return {
    create: async (req, res) => {
      const payload = normalizePayload(req.body, fields, req.uploadedFiles, req.admin?._id);
      const missing = required.find((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
      if (missing) {
        return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: `${entityLabel} کامل نیست` });
      }

      const item = await Model.create(payload);
      const populated = await applyPopulate(Model.findById(item._id));
      res.status(201).json({ acknowledgement: true, message: "Created", description: `${entityLabel} ذخیره شد`, data: populated });
    },

    getAll: async (req, res) => {
      const search = getSearchTerm(req.query);
      const { limit, page, skip } = getPaginationOptions(req.query);
      const query = {
        isDeleted: false,
        ...buildSearchQuery(search, searchFields),
        ...(req.query.status ? { status: req.query.status } : {}),
      };
      const [items, totalItems] = await Promise.all([
        applyPopulate(Model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)),
        Model.countDocuments(query),
      ]);
      res.status(200).json({
        acknowledgement: true,
        message: "OK",
        data: items,
        pagination: buildPaginationMeta({ limit, page, totalItems }),
      });
    },

    getOne: async (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه معتبر نیست" });
      }
      const item = await applyPopulate(Model.findOne({ _id: req.params.id, isDeleted: false }));
      if (!item) {
        return res.status(404).json({ acknowledgement: false, message: "Not Found", description: `${entityLabel} پیدا نشد` });
      }
      res.status(200).json({ acknowledgement: true, message: "OK", data: item });
    },

    update: async (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه معتبر نیست" });
      }
      const item = await Model.findOne({ _id: req.params.id, isDeleted: false });
      if (!item) {
        return res.status(404).json({ acknowledgement: false, message: "Not Found", description: `${entityLabel} پیدا نشد` });
      }
      Object.assign(item, normalizePayload(req.body, fields, req.uploadedFiles, req.admin?._id));
      await item.save();
      const populated = await applyPopulate(Model.findById(item._id));
      res.status(200).json({ acknowledgement: true, message: "OK", description: `${entityLabel} به‌روزرسانی شد`, data: populated });
    },

    remove: async (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "شناسه معتبر نیست" });
      }
      const item = await Model.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );
      if (!item) {
        return res.status(404).json({ acknowledgement: false, message: "Not Found", description: `${entityLabel} پیدا نشد` });
      }
      res.status(200).json({ acknowledgement: true, message: "OK", description: `${entityLabel} حذف شد` });
    },
  };
}

module.exports = createCatalogEntityService;
