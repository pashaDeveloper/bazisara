const mongoose = require("mongoose");
const Category = require("../models/category.model");
const CategoryFilter = require("../models/categoryFilter.model");
const FilterDefinition = require("../models/filterDefinition.model");
const {
  buildSearchQuery,
  buildPaginationMeta,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

const SELECT_TYPES = ["select", "multi_select", "color"];
const NUMERIC_TYPES = ["number", "range"];

function isObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function ensureCategoryExists(categoryId) {
  if (!categoryId || !isObjectId(categoryId)) {
    throw new Error("شناسه دسته‌بندی معتبر نیست");
  }

  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
  }).select("_id");

  if (!category) {
    throw new Error("دسته‌بندی یافت نشد");
  }
}

async function ensureFilterExists(filterId) {
  if (!filterId || !isObjectId(filterId)) {
    throw new Error("شناسه فیلتر معتبر نیست");
  }

  const filter = await FilterDefinition.findOne({
    _id: filterId,
    isDeleted: false,
  });

  if (!filter) {
    throw new Error("تعریف فیلتر یافت نشد");
  }

  return filter;
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

function buildPayload(body, definition) {
  const type = definition?.type || body.type;
  const hasOptions = Object.prototype.hasOwnProperty.call(body, "options");
  const payload = {
    category: body.category,
    filter: body.filter || definition?._id || null,
    key: definition?.key || String(body.key || "").trim().toLowerCase(),
    label: definition?.label || String(body.label || "").trim(),
    type,
    options: hasOptions ? normalizeOptions(body.options) : [],
    min: normalizeNumber(body.min),
    max: normalizeNumber(body.max),
    unit: body.unit !== undefined ? String(body.unit || "").trim() : definition?.unit || "",
    isRequired: Boolean(body.isRequired),
    sortOrder: normalizeNumber(body.sortOrder) || 0,
    status: body.isActive === false || body.status === "inactive" ? "inactive" : "active",
  };

  if (payload.min === null && definition?.min !== undefined) payload.min = definition.min;
  if (payload.max === null && definition?.max !== undefined) payload.max = definition.max;

  if (!payload.label) {
    throw new Error("عنوان فیلتر الزامی است");
  }

  if (!payload.key) {
    throw new Error("کلید فیلتر الزامی است");
  }

  if (SELECT_TYPES.includes(payload.type) && payload.options.length === 0) {
    throw new Error("برای این نوع فیلتر حداقل یک گزینه وارد کنید");
  }

  if (NUMERIC_TYPES.includes(payload.type) && payload.min !== null && payload.max !== null && payload.min > payload.max) {
    throw new Error("حداقل نباید از حداکثر بیشتر باشد");
  }

  if (!SELECT_TYPES.includes(payload.type)) {
    payload.options = [];
  }

  if (!NUMERIC_TYPES.includes(payload.type)) {
    payload.min = null;
    payload.max = null;
    payload.unit = "";
  }

  return payload;
}

exports.createCategoryFilter = async (req, res) => {
  await ensureCategoryExists(req.body.category);
  const definition = await ensureFilterExists(req.body.filter);
  const payload = buildPayload(req.body, definition);

  const filter = await CategoryFilter.create(payload);
  await filter.populate("category", "name parent");
  await filter.populate("filter", "key label type options min max unit");

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "فیلتر دسته‌بندی با موفقیت ایجاد شد",
    data: formatCategoryFilter(filter),
  });
};

function formatCategoryFilter(item) {
  const object = item.toObject ? item.toObject() : item;
  const definition = object.filter || {};

  return {
    ...object,
    key: definition.key || object.key,
    label: definition.label || object.label,
    type: definition.type || object.type,
    options: object.options || [],
    min: object.min ?? definition.min ?? null,
    max: object.max ?? definition.max ?? null,
    unit: object.unit || definition.unit || "",
  };
}

exports.getCategoryFilters = async (req, res) => {
  const query = { isDeleted: false };
  const search = getSearchTerm(req.query);

  if (req.query.category) {
    if (!isObjectId(req.query.category)) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Bad Request",
        description: "شناسه دسته‌بندی معتبر نیست",
      });
    }

    query.category = req.query.category;
  }

  Object.assign(
    query,
    buildSearchQuery(search, [
      "key",
      "label",
      "type",
      "unit",
      "options.label",
      "options.value",
    ])
  );

  const { limit, page, skip } = getPaginationOptions(req.query);
  const [filters, totalItems] = await Promise.all([
    CategoryFilter.find(query)
      .populate("category", "name parent")
      .populate("filter", "key label type options min max unit")
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CategoryFilter.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست فیلترهای دسته‌بندی دریافت شد",
    data: filters.map(formatCategoryFilter),
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.reorderCategoryFilters = async (req, res) => {
  const { orderedIds = [], startSortOrder = 0 } = req.body;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "لیست فیلترها برای مرتب‌سازی معتبر نیست",
    });
  }

  const invalidId = orderedIds.find((id) => !isObjectId(id));
  if (invalidId) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه فیلتر معتبر نیست",
    });
  }

  const start = normalizeNumber(startSortOrder) || 0;

  await CategoryFilter.bulkWrite(
    orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, isDeleted: false },
        update: { $set: { sortOrder: start + index } },
      },
    }))
  );

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "ترتیب فیلترها ذخیره شد",
  });
};

exports.getCategoryFilter = async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه فیلتر معتبر نیست",
    });
  }

  const filter = await CategoryFilter.findOne({ _id: id, isDeleted: false })
    .populate("category", "name parent")
    .populate("filter", "key label type options min max unit");

  if (!filter) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "فیلتر دسته‌بندی یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "جزئیات فیلتر دسته‌بندی دریافت شد",
    data: formatCategoryFilter(filter),
  });
};

exports.updateCategoryFilter = async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه فیلتر معتبر نیست",
    });
  }

  const filter = await CategoryFilter.findOne({ _id: id, isDeleted: false });
  if (!filter) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "فیلتر دسته‌بندی یافت نشد",
    });
  }

  const merged = { ...filter.toObject(), ...req.body };
  await ensureCategoryExists(merged.category);
  const definition = await ensureFilterExists(merged.filter);
  const payload = buildPayload(merged, definition);

  Object.assign(filter, payload);
  await filter.save();
  await filter.populate("category", "name parent");
  await filter.populate("filter", "key label type options min max unit");

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "فیلتر دسته‌بندی با موفقیت به‌روزرسانی شد",
    data: formatCategoryFilter(filter),
  });
};

exports.deleteCategoryFilter = async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه فیلتر معتبر نیست",
    });
  }

  const filter = await CategoryFilter.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!filter) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "فیلتر دسته‌بندی یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "فیلتر دسته‌بندی با موفقیت حذف شد",
  });
};
