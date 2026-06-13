const mongoose = require("mongoose");
const FilterDefinition = require("../models/filterDefinition.model");
const {
  buildPaginationMeta,
  buildSearchQuery,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

const SELECT_TYPES = ["select", "multi_select", "color"];
const NUMERIC_TYPES = ["number", "range"];

function isObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeOptions(options = []) {
  if (!Array.isArray(options)) return [];

  return options
    .map((option) => ({
      label: String(option.label || "").trim(),
      value: String(option.value || option.label || "").trim(),
    }))
    .filter((option) => option.label && option.value);
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function buildPayload(body) {
  const payload = {
    key: String(body.key || "").trim().toLowerCase(),
    label: String(body.label || "").trim(),
    type: body.type || "select",
    options: normalizeOptions(body.options),
    min: normalizeNumber(body.min),
    max: normalizeNumber(body.max),
    unit: String(body.unit || "").trim(),
    status: body.isActive === false || body.status === "inactive" ? "inactive" : "active",
  };

  if (!payload.label) throw new Error("عنوان فیلتر الزامی است");
  if (!payload.key) throw new Error("کلید فیلتر الزامی است");
  if (NUMERIC_TYPES.includes(payload.type) && payload.min !== null && payload.max !== null && payload.min > payload.max) {
    throw new Error("حداقل نباید از حداکثر بیشتر باشد");
  }
  if (!SELECT_TYPES.includes(payload.type)) payload.options = [];
  if (!NUMERIC_TYPES.includes(payload.type)) {
    payload.min = null;
    payload.max = null;
    payload.unit = "";
  }

  return payload;
}

exports.createFilterDefinition = async (req, res) => {
  const payload = buildPayload(req.body);
  payload.creator = req.admin?._id || null;
  const filter = await FilterDefinition.create(payload);

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "تعریف فیلتر با موفقیت ایجاد شد",
    data: filter,
  });
};

exports.getFilterDefinitions = async (req, res) => {
  const search = getSearchTerm(req.query);
  const query = {
    isDeleted: false,
    ...buildSearchQuery(search, ["key", "label", "type", "unit", "options.label", "options.value"]),
  };

  const { limit, page, skip } = getPaginationOptions(req.query);
  const [filters, totalItems] = await Promise.all([
    FilterDefinition.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    FilterDefinition.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست تعریف فیلترها دریافت شد",
    data: filters,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getFilterDefinition = async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه فیلتر معتبر نیست",
    });
  }

  const filter = await FilterDefinition.findOne({ _id: id, isDeleted: false });
  if (!filter) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "تعریف فیلتر یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "جزئیات تعریف فیلتر دریافت شد",
    data: filter,
  });
};

exports.updateFilterDefinition = async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه فیلتر معتبر نیست",
    });
  }

  const filter = await FilterDefinition.findOne({ _id: id, isDeleted: false });
  if (!filter) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "تعریف فیلتر یافت نشد",
    });
  }

  Object.assign(filter, buildPayload({ ...filter.toObject(), ...req.body }));
  await filter.save();

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "تعریف فیلتر با موفقیت به‌روزرسانی شد",
    data: filter,
  });
};

exports.deleteFilterDefinition = async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه فیلتر معتبر نیست",
    });
  }

  const filter = await FilterDefinition.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!filter) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "تعریف فیلتر یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "تعریف فیلتر با موفقیت حذف شد",
  });
};
