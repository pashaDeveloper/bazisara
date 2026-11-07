const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const { getMediaSettings, updateMediaSettings } = require("../utils/mediaSettings.util");
const router = express.Router();

router.get("/image-preview", verify, authorize("owner", "superAdmin", "admin", "operator"), async (req, res, next) => {
  try {
    res.json({ acknowledgement: true, data: await getMediaSettings() });
  } catch (error) {
    res.status(500).json({ acknowledgement: false, description: "دریافت تنظیمات تصویر انجام نشد" });
  }
});

router.patch("/image-preview", verify, authorize("owner", "superAdmin", "admin"), async (req, res, next) => {
  try {
    const data = await updateMediaSettings(req.body || {});
    res.json({ acknowledgement: true, description: "تنظیمات تصویر ذخیره شد", data });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ acknowledgement: false, description: error.message });
    res.status(500).json({ acknowledgement: false, description: "ذخیره تنظیمات تصویر انجام نشد" });
  }
});

module.exports = router;
