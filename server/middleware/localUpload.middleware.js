const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const uploadRoot = path.join(__dirname, "..", "uploads");

// Helper -> ساخت فولدر براساس تاریخ
const getDateFolder = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getBaseFolder = (customFolder) => {
  return customFolder ? `${customFolder}/${getDateFolder()}` : getDateFolder();
};

const getBaseUrl = (req) => {
  return process.env.LOCAL_UPLOAD_BASE_URL || `${req.protocol}://${req.get("host")}`;
};

const prepareFile = async (file) => {
  const originalExtension = path.extname(file.originalname).replace(".", "").toLowerCase();
  let extension = originalExtension || "bin";
  let fileBuffer = file.buffer;

  if (["jpg", "jpeg", "png"].includes(extension)) {
    fileBuffer = await sharp(file.buffer)
      .toFormat("webp", {
        quality: 80,
        lossless: extension === "png",
      })
      .toBuffer();
    extension = "webp";
  }

  return { extension, fileBuffer };
};

const uploadLocal = (customFolder = null) => {
  const storage = multer.memoryStorage();
  const fileFilter = (req, file, cb) => cb(null, true);
  const multerInstance = multer({ storage, fileFilter });

  const localUploadMiddleware = (fieldConfig) => async (req, res, next) => {
    multerInstance.fields(fieldConfig)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "File upload error" });
      }

      const baseFolder = getBaseFolder(customFolder);
      req.uploadedFiles = {};

      try {
        const fileFields = Object.keys(req.files || {});

        for (const field of fileFields) {
          req.uploadedFiles[field] = [];

          for (const file of req.files[field]) {
            const hashedName = crypto.randomBytes(16).toString("hex");
            const { extension, fileBuffer } = await prepareFile(file);
            const filename = `${hashedName}.${extension}`;
            const relativeFolder = baseFolder.split("/").filter(Boolean).join(path.sep);
            const destinationFolder = path.join(uploadRoot, relativeFolder);
            const filePath = path.join(destinationFolder, filename);
            const publicId = `${baseFolder}/${filename}`;
            const publicPath = publicId.split("/").map(encodeURIComponent).join("/");

            await fs.mkdir(destinationFolder, { recursive: true });
            await fs.writeFile(filePath, fileBuffer);

            req.uploadedFiles[field].push({
              url: `${getBaseUrl(req)}/uploads/${publicPath}`,
              public_id: publicId,
              key: publicId,
              filename,
              path: filePath,
              format: extension,
              resource_type: file.mimetype?.startsWith("video/")
                ? "video"
                : file.mimetype?.startsWith("image/")
                  ? "image"
                  : "raw",
              storage: "local",
            });
          }
        }

        next();
      } catch (error) {
        console.error("Error uploading locally:", error);
        res.status(500).json({
          acknowledgement: false,
          message: "Internal Server Error",
          description: `خطا در ذخیره فایل‌ها به صورت local: ${error.message}`,
        });
      }
    });
  };

  return {
    single: (fieldName) => localUploadMiddleware([{ name: fieldName, maxCount: 1 }]),
    fields: (fieldsConfig) => localUploadMiddleware(fieldsConfig),
  };
};

module.exports = uploadLocal;
