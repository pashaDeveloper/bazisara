const Admin = require("../models/admin.model");
const { getAdminProfileSnapshot } = require("../utils/adminProfile.util");

function requireAdminProfileLevel(minLevel = 1) {
  return async (req, res, next) => {
    try {
      const adminId = req.admin?._id;
      if (!adminId) {
        return res.status(401).json({
          acknowledgement: false,
          message: "Unauthorized",
          description: "ابتدا وارد حساب خود شوید",
        });
      }

      const admin = await Admin.findById(adminId).select("-password").populate("address");
      if (!admin) {
        return res.status(404).json({
          acknowledgement: false,
          message: "Not Found",
          description: "کاربر یافت نشد",
        });
      }

      const plainAdmin = typeof admin.toObject === "function" ? admin.toObject() : admin;
      const profile = getAdminProfileSnapshot(plainAdmin);
      req.adminRecord = {
        ...plainAdmin,
        ...profile,
      };

      if (profile.level < minLevel) {
        return res.status(403).json({
          acknowledgement: false,
          message: "Forbidden",
          description:
            minLevel >= 3
              ? "برای انجام این کار باید سطح 3 پروفایل را تکمیل کنید"
              : "برای انجام این کار باید سطح 2 پروفایل را تکمیل کنید",
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        acknowledgement: false,
        message: "Error",
        description: "خطا در بررسی سطح دسترسی",
        error: error.message,
      });
    }
  };
}

module.exports = requireAdminProfileLevel;
