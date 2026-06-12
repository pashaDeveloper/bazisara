const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Admin = require("../models/admin.model");
const { getAdminProfileSnapshot } = require("../utils/adminProfile.util");

async function optionalVerifyAdmin(req, _res, next) {
  try {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) return next();

    const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET);
    req.admin = decoded;

    const admin = await Admin.findById(decoded._id).select("-password").populate("address");
    if (admin) {
      const plainAdmin = typeof admin.toObject === "function" ? admin.toObject() : admin;
      req.adminRecord = {
        ...plainAdmin,
        ...getAdminProfileSnapshot(plainAdmin),
      };
    }
  } catch (_) {
    // ignore invalid optional token
  }

  next();
}

module.exports = optionalVerifyAdmin;
