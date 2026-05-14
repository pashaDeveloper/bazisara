const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const upload = require("../middleware/upload.middleware");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

router.post(
  "/create",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("page-builder").single("file"),
  (req, res) => {
    const file = req.uploadedFiles?.file?.[0];

    if (!file) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Bad Request",
        description: "فایلی برای آپلود ارسال نشده است",
      });
    }

    res.status(201).json({
      acknowledgement: true,
      message: "Created",
      description: "فایل با موفقیت آپلود شد",
      data: file,
    });
  }
);

router.delete(
  "/delete",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  async (req, res, next) => {
    try {
      const { public_id, resource_type = "image" } = req.body || {};

      if (!public_id) {
        return res.status(400).json({
          acknowledgement: false,
          message: "Bad Request",
          description: "شناسه فایل الزامی است",
        });
      }

      await cloudinary.uploader.destroy(public_id, { resource_type });

      res.status(200).json({
        acknowledgement: true,
        message: "OK",
        description: "فایل حذف شد",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
