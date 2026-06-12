const mongoose = require("mongoose");
const Category = require("../models/category.model");
const Icon = require("../models/icon.model");
const {
  buildSearchQuery,
  buildPaginationMeta,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

async function ensureParentExists(parentId) {
  if (!parentId) return null;

  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    throw new Error("شناسه والد معتبر نیست");
  }

  const parent = await Category.findOne({ _id: parentId, isDeleted: false });
  if (!parent) {
    throw new Error("دسته‌بندی والد یافت نشد");
  }

  return parent;
}

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

async function validateNoCycle(categoryId, parentId) {
  if (!parentId) return;
  if (String(categoryId) === String(parentId)) {
    throw new Error("دسته‌بندی نمی‌تواند والد خودش باشد");
  }

  let current = await Category.findById(parentId).select("parent");
  while (current) {
    if (String(current._id) === String(categoryId)) {
      throw new Error("ساختار حلقه‌ای در دسته‌بندی مجاز نیست");
    }

    if (!current.parent) break;
    current = await Category.findById(current.parent).select("parent");
  }
}

function buildCategoryTree(categories, parent = null) {
  return categories
    .filter((item) => String(item.parent || "") === String(parent || ""))
    .map((item) => ({
      ...item,
      children: buildCategoryTree(categories, item._id),
    }));
}

exports.createCategory = async (req, res) => {
  const { name, description = "", parent = null, icon = "" } = req.body;

  if (!name) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "نام دسته‌بندی الزامی است",
    });
  }

  await ensureParentExists(parent);
  await ensureIconExists(icon);

  const category = await Category.create({
    name: String(name).trim(),
    description,
    icon: icon || null,
    image: req.uploadedFiles?.image?.[0]
        ? {
          url: req.uploadedFiles.image[0].url,
          public_id: req.uploadedFiles.image[0].public_id,
          storage: req.uploadedFiles.image[0].storage || "",
        }
      : undefined,
    parent: parent || null,
  });

  const populatedCategory = await category.populate("icon", "name svg color");

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "دسته‌بندی با موفقیت ایجاد شد",
    data: populatedCategory,
  });
};

exports.getCategories = async (req, res) => {
  const search = getSearchTerm(req.query);
  const query = {
    isDeleted: false,
    ...buildSearchQuery(search, ["name", "description"]),
  };
  const { limit, page, skip } = getPaginationOptions(req.query);
  const [categories, totalItems] = await Promise.all([
    Category.find(query)
      .populate("parent", "name")
      .populate("icon", "name svg color")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Category.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست دسته‌بندی‌ها دریافت شد",
    data: categories,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getCategoryTree = async (_, res) => {
  const categories = await Category.find({ isDeleted: false })
    .select("_id name description icon image parent")
    .populate("icon", "name svg color")
    .lean();

  const tree = buildCategoryTree(categories, null);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "درخت دسته‌بندی دریافت شد",
    data: tree,
  });
};

exports.getCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه دسته‌بندی معتبر نیست",
    });
  }

  const category = await Category.findOne({ _id: id, isDeleted: false })
    .populate("parent", "name")
    .populate("icon", "name svg color");

  if (!category) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "دسته‌بندی یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "جزئیات دسته‌بندی دریافت شد",
    data: category,
  });
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, parent, icon } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه دسته‌بندی معتبر نیست",
    });
  }

  const category = await Category.findOne({ _id: id, isDeleted: false });
  if (!category) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "دسته‌بندی یافت نشد",
    });
  }

  if (parent !== undefined) {
    await ensureParentExists(parent);
    await validateNoCycle(id, parent);
    category.parent = parent || null;
  }

  if (name !== undefined) category.name = String(name).trim();
  if (description !== undefined) category.description = description;
  if (icon !== undefined) {
    await ensureIconExists(icon);
    category.icon = icon || null;
  }
  if (req.uploadedFiles?.image?.[0]) {
    category.image = {
      url: req.uploadedFiles.image[0].url,
      public_id: req.uploadedFiles.image[0].public_id,
      storage: req.uploadedFiles.image[0].storage || "",
    };
  }

  await category.save();

  const populatedCategory = await category.populate("icon", "name svg color");

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "دسته‌بندی با موفقیت به‌روزرسانی شد",
    data: populatedCategory,
  });
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه دسته‌بندی معتبر نیست",
    });
  }

  const hasChildren = await Category.exists({
    parent: id,
    isDeleted: false,
  });

  if (hasChildren) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "ابتدا زیر‌دسته‌ها را حذف یا جابه‌جا کنید",
    });
  }

  const category = await Category.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!category) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "دسته‌بندی یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "دسته‌بندی با موفقیت حذف شد",
  });
};
