const mongoose = require("mongoose");
const Genre = require("../models/genre.model");
const Icon = require("../models/icon.model");
const {
  buildSearchQuery,
  buildPaginationMeta,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");
const { mediaFromUploadOrBody } = require("../utils/media.util");

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

exports.createGenre = async (req, res) => {
  const { name, description = "", icon = "" } = req.body;

  if (!name) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "نام ژانر الزامی است",
    });
  }

  await ensureIconExists(icon);

  const genre = await Genre.create({
    name: String(name).trim(),
    description,
    icon: icon || null,
    image: mediaFromUploadOrBody(req.uploadedFiles, "image", req.body.image),
    creator: req.admin?._id || null,
  });
  const populatedGenre = await genre.populate("icon", "name svg color");

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "ژانر با موفقیت ایجاد شد",
    data: populatedGenre,
  });
};

exports.getGenres = async (req, res) => {
  const search = getSearchTerm(req.query);
  const query = {
    isDeleted: false,
    ...buildSearchQuery(search, ["name", "description"]),
  };
  const { limit, page, skip } = getPaginationOptions(req.query);
  const [genres, totalItems] = await Promise.all([
    Genre.find(query)
      .populate("icon", "name svg color")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Genre.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست ژانرها دریافت شد",
    data: genres,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getGenre = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه ژانر معتبر نیست",
    });
  }

  const genre = await Genre.findOne({ _id: id, isDeleted: false }).populate(
    "icon",
    "name svg color"
  );

  if (!genre) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "ژانر یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "جزئیات ژانر دریافت شد",
    data: genre,
  });
};

exports.updateGenre = async (req, res) => {
  const { id } = req.params;
  const { name, description, icon } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه ژانر معتبر نیست",
    });
  }

  const genre = await Genre.findOne({ _id: id, isDeleted: false });
  if (!genre) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "ژانر یافت نشد",
    });
  }

  if (name !== undefined) genre.name = String(name).trim();
  if (description !== undefined) genre.description = description;
  if (icon !== undefined) {
    await ensureIconExists(icon);
    genre.icon = icon || null;
  }
  const image = mediaFromUploadOrBody(req.uploadedFiles, "image", req.body.image);
  if (image) genre.image = image;

  await genre.save();
  const populatedGenre = await genre.populate("icon", "name svg color");

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "ژانر با موفقیت به‌روزرسانی شد",
    data: populatedGenre,
  });
};

exports.deleteGenre = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه ژانر معتبر نیست",
    });
  }

  const genre = await Genre.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!genre) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "ژانر یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "ژانر با موفقیت حذف شد",
  });
};
