const mongoose = require("mongoose");
const Icon = require("../models/icon.model");
const {
  buildSearchQuery,
  buildPaginationMeta,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

function isSvg(value) {
  return /^<svg[\s>][\s\S]*<\/svg>$/i.test(String(value || "").trim());
}

exports.createIcon = async (req, res) => {
  const { name, svg, color = "" } = req.body;

  if (!name || !svg) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "Icon name and SVG are required",
    });
  }

  if (!isSvg(svg)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "SVG icon is not valid",
    });
  }

  const icon = await Icon.create({
    name: String(name).trim(),
    svg: String(svg).trim(),
    color: String(color || "").trim(),
  });

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "Icon created successfully",
    data: icon,
  });
};

exports.getIcons = async (req, res) => {
  const search = getSearchTerm(req.query);
  const query = {
    isDeleted: false,
    ...buildSearchQuery(search, ["name", "color"]),
  };
  const { limit, page, skip } = getPaginationOptions(req.query);
  const [icons, totalItems] = await Promise.all([
    Icon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Icon.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "Icons received successfully",
    data: icons,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getIcon = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "Icon id is not valid",
    });
  }

  const icon = await Icon.findOne({ _id: id, isDeleted: false });

  if (!icon) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Icon not found",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "Icon received successfully",
    data: icon,
  });
};

exports.updateIcon = async (req, res) => {
  const { id } = req.params;
  const { name, svg, color } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "Icon id is not valid",
    });
  }

  const icon = await Icon.findOne({ _id: id, isDeleted: false });
  if (!icon) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Icon not found",
    });
  }

  if (name !== undefined) icon.name = String(name).trim();
  if (svg !== undefined) {
    if (!isSvg(svg)) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Bad Request",
        description: "SVG icon is not valid",
      });
    }

    icon.svg = String(svg).trim();
  }
  if (color !== undefined) icon.color = String(color || "").trim();

  await icon.save();

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "Icon updated successfully",
    data: icon,
  });
};

exports.deleteIcon = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "Icon id is not valid",
    });
  }

  const icon = await Icon.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!icon) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Icon not found",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "Icon deleted successfully",
  });
};
