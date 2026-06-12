const Admin = require("../models/admin.model");
const Address = require("../models/address.model");
const Game = require("../models/game.model");
const Article = require("../models/article.model");
const Slider = require("../models/slider.model");
const remove = require("../utils/remove.util");
const token = require("../utils/token.util");
const { getAdminProfileSnapshot } = require("../utils/adminProfile.util");

const OWNER_ROLES = ["owner", "superAdmin"];
const adminProfileFields = [
  "name",
  "email",
  "phone",
  "nationalCode",
  "biography",
  "position",
  "department",
  "gender",
  "birthDate",
  "landline",
  "emergencyPhone"
];
const addressFields = ["province", "city", "address", "plateNumber", "unit", "postalCode"];

function pickFields(source, fields) {
  return fields.reduce((payload, field) => {
    if (source[field] !== undefined) payload[field] = source[field];
    return payload;
  }, {});
}

function normalizeNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function buildAvatar(req, existingAdmin) {
  const uploaded = req.uploadedFiles?.avatar?.[0] || req.file;
  if (uploaded) {
    return {
      url: uploaded.url || uploaded.path,
      public_id: uploaded.key || uploaded.public_id || uploaded.filename || "",
      storage: uploaded.storage || ""
    };
  }

  if (req.body.avatarUrl !== undefined) {
    return {
      url: req.body.avatarUrl || null,
      public_id: existingAdmin?.avatar?.public_id || null,
      storage: existingAdmin?.avatar?.storage || ""
    };
  }

  return existingAdmin?.avatar;
}

async function upsertAdminAddress(adminId, body) {
  const payload = pickFields(body, addressFields);
  if (payload.plateNumber !== undefined) payload.plateNumber = normalizeNumber(payload.plateNumber);
  if (payload.postalCode !== undefined) payload.postalCode = normalizeNumber(payload.postalCode);

  const hasAnyAddressValue = Object.values(payload).some((value) => value !== undefined && value !== "");
  if (!hasAnyAddressValue) return null;

  return Address.findOneAndUpdate(
    { admin: adminId, isDeleted: false },
    { $set: { admin: adminId, isDefault: true, ...payload } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

function populateAdmin(query) {
  return query.populate("address");
}

function decorateAdmin(admin) {
  if (!admin) return admin;
  const plainAdmin = typeof admin.toObject === "function" ? admin.toObject() : { ...admin };
  return {
    ...plainAdmin,
    ...getAdminProfileSnapshot(plainAdmin),
  };
}

function buildApprovalItem(type, item) {
  const base = typeof item.toObject === "function" ? item.toObject() : item;
  return {
    type,
    _id: base._id,
    title: base.title || base.name || base.subtitle || "محتوای بدون عنوان",
    status: base.status,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
    slug: base.slug || "",
    cover: base.cover || base.image || base.cardDesktopCover || null,
    category: base.category || null,
    author: base.author || "",
    excerpt: base.excerpt || base.shortDescription || base.subtitle || "",
  };
}

async function getPendingApprovals() {
  const [games, articles, sliders] = await Promise.all([
    Game.find({ isDeleted: false, status: "pending" })
      .sort({ updatedAt: -1 })
      .select("title slug status createdAt updatedAt cover cardDesktopCover category shortDescription"),
    Article.find({ isDeleted: false, status: "pending" })
      .sort({ updatedAt: -1 })
      .select("title slug status createdAt updatedAt cover excerpt author category"),
    Slider.find({ isDeleted: false, status: "pending" })
      .sort({ updatedAt: -1 })
      .select("title subtitle slug status createdAt updatedAt image category"),
  ]);

  return [
    ...games.map((item) => buildApprovalItem("game", item)),
    ...articles.map((item) => buildApprovalItem("article", item)),
    ...sliders.map((item) => buildApprovalItem("slider", item)),
  ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

/* sign up an admin */
exports.signUp = async (req, res) => {
  const { body, file } = req;
  const {
    name,
    email,
    password,
    phone,
    avatarUrl,
    province,
    city,
    address,
    plateNumber,
    postalCode
  } = body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      acknowledgement: false,
      message: "درخواست نادرست",
      description: "همه فیلدها الزامی است",
      isSuccess: false
    });
  }

  const existingAdmin = await Admin.findOne({
    $or: [{ email: email }, { phone: phone }]
  });
  if (existingAdmin) {
    return {
      success: false,
      message:
        "کاربری با این ایمیل یا شماره تلفن قبلاً ثبت‌نام کرده است. لطفاً به صفحه ورود بروید.",
      redirectToLogin: true
    };
  }

  if (
    req.uploadedFiles &&
    req.uploadedFiles["avatar"] &&
    req.uploadedFiles["avatar"].length > 0
  ) {
    avatar = {
      url: req.uploadedFiles["avatar"][0].url,
      public_id: req.uploadedFiles["avatar"][0].key,
      storage: req.uploadedFiles["avatar"][0].storage || ""
    };
  } else {
    avatar = {
      url: avatarUrl,
      public_id: null
    };
  }
  const adminCount = await Admin.countDocuments();
  const role = adminCount === 0 ? "owner" : "buyer";
  const status = adminCount === 0 ? "active" : "inactive";

  const admin = new Admin({
    name: body.name,
    email: body.email,
    password: body.password,
    phone: body.phone,
    role: role,
    status: status,
    avatar
  });

  await admin.save();

  const hasAddressPayload =
    province &&
    city &&
    address &&
    plateNumber !== undefined &&
    plateNumber !== "" &&
    postalCode !== undefined &&
    postalCode !== "";

  if (hasAddressPayload) {
    const adminAddress = await Address.create({
      admin: admin._id,
      province,
      city,
      address,
      plateNumber: Number(plateNumber),
      postalCode: Number(postalCode),
      isDefault: true
    });

    admin.address = adminAddress._id;
    await admin.save({ validateBeforeSave: false });
  }

  res.status(201).json({
    acknowledgement: true,
    message: "تبریک ",
    description: "ثبت نام شما با موفقیت انجام شد",
    isSuccess: true
  });

  return admin;
};

/* sign in an admin */ 
exports.signIn = async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });

  console.log(admin)
  if (!admin) {
    res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "کاربر یافت نشد"
    });
  } else {
    const isPasswordValid = admin.comparePassword(
      req.body.password,
      admin.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        acknowledgement: false,
        message: "Unauthorized",
        description: "رمز عبور صحیح نیست"
      });
    } else {
      if (admin.status === "inactive") {
        res.status(401).json({
          acknowledgement: false,
          message: "Unauthorized",
          description: "حساب شما در حال حاضر  غیر فعال است لطفا منتظر بمانید"
        });
      } else {

        const accessToken = token({
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status
        });
        res.status(200).json({
          acknowledgement: true,
          message: "OK",
          description: "شمابا موفقیت ورود کردید",
          accessToken
        });
      }
    }
  }
};

/* reset admin password */
exports.forgotPassword = async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });

  if (!admin) {
    res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "کاربر یافت نشد"
    });
  } else {
    const hashedPassword = admin.encryptedPassword(req.body.password);

    await Admin.findOneAndUpdate(
      { email: req.body.email },
      { password: hashedPassword },
      { runValidators: false, returnOriginal: false }
    );

    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "پسورد کاربر با موفقیت تغییر کرد"
    });
  }
};

exports.persistLogin = async (req, res) => {
  console.log(req.admin)
  const admin = await populateAdmin(Admin.findById(req.admin._id).select("-password"));

  if (!admin) {
    res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "کاربر یافت نشد"
    });
  } else {
    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "ورود با موفقیت انجام شد",
      data: decorateAdmin(admin)
    });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const status = req.query.status;
    const search = (req.query.search || "").trim();

    // Build query
    let query = { isDeleted: false };
    if (role && role !== "all") {
      query.role = role;
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get admins with pagination
    const admins = await Admin.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select("-password")
      .populate("address");
      
    // Get total count for pagination
    const total = await Admin.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "دریافت موفق مدیران",
      data: {
        admins: admins.map((admin) => decorateAdmin(admin)),
        total,
        page,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({
      acknowledgement: false,
      message: "Error",
      description: "خطا در دریافت مدیران",
      error: error.message
    });
  }
};

exports.getAdmin = async (req, res) => {
  const admin = await populateAdmin(Admin.findById(req.params.id).select("-password"));

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: `اطلاعات کاربر${admin.name}' با موفقیت دریافت شد`,
    data: decorateAdmin(admin)
  });
};

exports.updateProfile = async (req, res) => {
  const existingAdmin = await Admin.findById(req.admin._id);

  if (!existingAdmin) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "کاربر یافت نشد"
    });
  }

  const adminPayload = pickFields(req.body, adminProfileFields);
  const avatar = buildAvatar(req, existingAdmin);
  if (avatar) adminPayload.avatar = avatar;

  const updatedAdmin = await Admin.findByIdAndUpdate(
    existingAdmin._id,
    { $set: adminPayload },
    { runValidators: true, new: true }
  );

  const address = await upsertAdminAddress(existingAdmin._id, req.body);
  if (address && String(updatedAdmin.address || "") !== String(address._id)) {
    updatedAdmin.address = address._id;
    await updatedAdmin.save({ validateBeforeSave: false });
  }

  const populatedAdmin = await populateAdmin(Admin.findById(updatedAdmin._id).select("-password"));

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "پروفایل با موفقیت به‌روزرسانی شد",
    data: decorateAdmin(populatedAdmin)
  });
};

exports.getApprovals = async (req, res) => {
  const data = await getPendingApprovals();

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست محتوای در انتظار تایید دریافت شد",
    data,
  });
};

exports.approveApproval = async (req, res) => {
  const { type, id } = req.params;
  const modelMap = {
    game: Game,
    article: Article,
    slider: Slider,
  };

  const Model = modelMap[type];
  if (!Model) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "نوع محتوا معتبر نیست",
    });
  }

  const item = await Model.findOne({ _id: id, isDeleted: false, status: "pending" });
  if (!item) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "محتوای در انتظار تایید پیدا نشد",
    });
  }

  item.status = "active";
  await item.save();

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "محتوا با موفقیت تایید شد",
    data: buildApprovalItem(type, item),
  });
};

/* update admin information */
exports.updateAdmin = async (req, res) => {
  const existingAdmin = await Admin.findById(req.admin._id);
  const admin = req.body;

  // بررسی عدم تغییر نقش superAdmin
  if (OWNER_ROLES.includes(admin.role)) {
    return res.status(403).json({
      acknowledgement: false,
      message: "Forbidden",
      description: "کاربر مدیر کل قابل ویرایش نیست"
    });
  }

  // حذف تصویر آواتار قدیمی اگر تصویر جدیدی ارسال شده
  if (
    req.uploadedFiles &&
    req.uploadedFiles["avatar"] &&
    req.uploadedFiles["avatar"].length > 0
  ) {
    // حذف تصویر قبلی از سرویس ذخیره‌سازی
    await remove("avatar", existingAdmin.avatar?.public_id);

    // تنظیم تصویر جدید
    avatar = {
      url: req.uploadedFiles["avatar"][0].url,
      public_id: req.uploadedFiles["avatar"][0].key,
      storage: req.uploadedFiles["avatar"][0].storage || ""
    };
  } else if (!req.body.avatarUrl) {
    // اگر تصویر جدید نیست، حذف تصویر قبلی
    if (existingAdmin.avatar?.public_id) {
      await remove("avatar", existingAdmin.avatar.public_id);
    }

    // در صورت عدم ارسال آدرس جدید برای تصویر، مقدار پیش‌فرض
    avatar = {
      url: null,
      public_id: null
    };
  }

  // به‌روزرسانی اطلاعات کاربر
  const updatedAdmin = await Admin.findByIdAndUpdate(
    existingAdmin._id,
    {
      $set: {
        ...admin,
        avatar // اطمینان از ارسال تصویر جدید
      }
    },
    {
      runValidators: true,
      new: true // اطمینان از اینکه داده‌های به‌روزرسانی‌شده برگردند
    }
  );

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: `اطلاعات ${updatedAdmin.name} با موفقیت تغییر کرد`
  });
};

/* update admin information */
exports.updateAdminInfo = async (req, res) => {
  const existingAdmin = await Admin.findById(req.params.id);
  const admin = req.body;

  // بررسی عدم تغییر نقش superAdmin
  if (OWNER_ROLES.includes(admin.role)) {
    return res.status(403).json({
      acknowledgement: false,
      message: "دسترسی ممنوع",
      description: "کاربر مدیر کل قابل ویرایش نیست"
    });
  }

  // متغیر avatar برای ذخیره‌سازی اطلاعات آواتار جدید
  let avatar = existingAdmin.avatar;

  // حذف تصویر آواتار قدیمی اگر تصویر جدیدی ارسال شده
  if (
    req.uploadedFiles &&
    req.uploadedFiles["avatar"] &&
    req.uploadedFiles["avatar"].length > 0
  ) {
    // حذف تصویر قبلی از سرویس ذخیره‌سازی
    await remove("avatar", existingAdmin.avatar?.public_id);

    // تنظیم تصویر جدید
    avatar = {
      url: req.uploadedFiles["avatar"][0].url,
      public_id: req.uploadedFiles["avatar"][0].key,
      storage: req.uploadedFiles["avatar"][0].storage || ""
    };
  } else if (req.body.avatarUrl) {
    // اگر تصویر جدید نیست، حذف تصویر قبلی
    if (existingAdmin.avatar?.public_id) {
      await remove("avatar", existingAdmin.avatar.public_id);
    }

    // در صورت عدم ارسال آدرس جدید برای تصویر، مقدار پیش‌فرض
    avatar = {
      url: null,
      public_id: null
    };
  }

  // به‌روزرسانی اطلاعات کاربر همراه با آواتار جدید
  const updatedAdmin = await Admin.findByIdAndUpdate(
    existingAdmin._id,
    { $set: { ...admin, avatar } },
    {
      runValidators: true,
      new: true
    }
  );

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: `اطلاعات ${updatedAdmin.name} با موفقیت تغییر کرد`
  });
};

/* delete admin information */
exports.deleteAdmin = async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    {
      isDeleted: true,
      deletedAt: Date.now()
    },
    { new: true }
  );

  if (!admin) {
    return res.status(404).json({
      acknowledgement: false,
      message: "کاربر یافت نشد"
    });
  }
  if (OWNER_ROLES.includes(admin.role)) {
    return res.status(403).json({
      acknowledgement: false,
      message: "ممنوع",
      description: "کاربر مدیر کل قابل حذف نیست"
    });
  }




  

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: ` کاربر${admin.name}'s با موفقیت حذف شد`
  });
};



