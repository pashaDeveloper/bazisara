const mongoose = require("mongoose");
const Category = require("../models/category.model");
const Slider = require("../models/slider.model");
const {
  buildPaginationMeta,
  buildSearchQuery,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

function buildMedia(file) {
  if (!file) return undefined;
  return {
    url: file.url,
    public_id: file.public_id,
    storage: file.storage || "",
  };
}

function normalizeSliderPayload(body, uploadedFiles) {
  const payload = {
    title: body.title !== undefined ? String(body.title).trim() : undefined,
    subtitle: body.subtitle !== undefined ? String(body.subtitle).trim() : undefined,
    link: body.link !== undefined ? String(body.link).trim() : undefined,
    category:
      body.category !== undefined
        ? body.category && mongoose.Types.ObjectId.isValid(body.category)
          ? body.category
          : null
        : undefined,
    order:
      body.order !== undefined && body.order !== ""
        ? Number(body.order)
        : undefined,
    status: body.status !== undefined ? String(body.status).trim() : undefined,
  };

  const image = buildMedia(uploadedFiles?.image?.[0]);
  if (image) payload.image = image;
  payload.status = "pending";

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

async function populateSlider(query) {
  return query.populate("category", "name slug");
}

async function isValidSliderCategory(category) {
  if (!category) return true;
  return Boolean(await Category.exists({ _id: category, isDeleted: false }));
}

exports.createSlider = async (req, res) => {
  const payload = normalizeSliderPayload(req.body, req.uploadedFiles);

  if (!payload.title) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "عنوان اسلایدر الزامی است",
    });
  }

  if (payload.order === undefined) {
    const lastSlider = await Slider.findOne({ isDeleted: false })
      .sort({ order: -1, createdAt: -1 })
      .select("order");
    payload.order = Number(lastSlider?.order || 0) + 1;
  }

  if (!(await isValidSliderCategory(payload.category))) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "دسته‌بندی اسلایدر معتبر نیست",
    });
  }

  payload.creator = req.admin?._id || null;
  const slider = await Slider.create(payload);
  const populatedSlider = await populateSlider(Slider.findById(slider._id));

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "اسلایدر ایجاد شد",
    data: populatedSlider,
  });
};

exports.getSliders = async (req, res) => {
  const search = getSearchTerm(req.query);
  const query = {
    isDeleted: false,
    ...(req.adminRecord ? {} : { status: "active" }),
    ...buildSearchQuery(search, ["title", "subtitle", "link"]),
  };
  const { limit, page, skip } = getPaginationOptions(req.query);
  const [sliders, totalItems] = await Promise.all([
    populateSlider(Slider.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit)),
    Slider.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست اسلایدرها دریافت شد",
    data: sliders,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getSlider = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه اسلایدر معتبر نیست",
    });
  }

  const slider = await populateSlider(
    Slider.findOne({
      _id: id,
      isDeleted: false,
      ...(req.adminRecord ? {} : { status: "active" }),
    })
  );
  if (!slider) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "اسلایدر یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "جزئیات اسلایدر دریافت شد",
    data: slider,
  });
};

exports.updateSlider = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه اسلایدر معتبر نیست",
    });
  }

  const slider = await Slider.findOne({ _id: id, isDeleted: false });
  if (!slider) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "اسلایدر یافت نشد",
    });
  }

  const payload = normalizeSliderPayload(req.body, req.uploadedFiles);
  if (!(await isValidSliderCategory(payload.category))) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "دسته‌بندی اسلایدر معتبر نیست",
    });
  }
  Object.assign(slider, payload);
  await slider.save();
  const populatedSlider = await populateSlider(Slider.findById(slider._id));

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "اسلایدر به‌روزرسانی شد",
    data: populatedSlider,
  });
};

exports.updateSliderStatus = async (req, res) => {
  const { id } = req.params;
  const status = String(req.body?.status || "").trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه اسلایدر معتبر نیست",
    });
  }

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "وضعیت اسلایدر معتبر نیست",
    });
  }

  const slider = await Slider.findOne({ _id: id, isDeleted: false });
  if (!slider) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "اسلایدر یافت نشد",
    });
  }

  if (slider.status === "pending" && status === "active" && req.admin?.role !== "owner") {
    return res.status(403).json({
      acknowledgement: false,
      message: "Forbidden",
      description: "فقط مدیر کل می‌تواند محتوای در انتظار تایید را فعال کند",
    });
  }

  const updatedSlider = await Slider.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { status },
    { new: true }
  );

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "وضعیت اسلایدر به‌روزرسانی شد",
    data: await populateSlider(Slider.findById(updatedSlider._id)),
  });
};

exports.reorderSliders = async (req, res) => {
  const sliders = Array.isArray(req.body?.sliders) ? req.body.sliders : [];

  if (!sliders.length) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "لیست ترتیب اسلایدرها خالی است",
    });
  }

  const invalidItem = sliders.find(
    (item) => !mongoose.Types.ObjectId.isValid(item?._id)
  );

  if (invalidItem) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه اسلایدر معتبر نیست",
    });
  }

  await Slider.bulkWrite(
    sliders.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id, isDeleted: false },
        update: {
          $set: {
            order: Number.isFinite(Number(item.order))
              ? Number(item.order)
              : index + 1,
          },
        },
      },
    }))
  );

  const updatedSliders = await populateSlider(Slider.find({ isDeleted: false }).sort({
    order: 1,
    createdAt: -1,
  }));

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "ترتیب اسلایدرها به‌روزرسانی شد",
    data: updatedSliders,
  });
};

exports.deleteSlider = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه اسلایدر معتبر نیست",
    });
  }

  const slider = await Slider.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!slider) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "اسلایدر یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "اسلایدر حذف شد",
  });
};
