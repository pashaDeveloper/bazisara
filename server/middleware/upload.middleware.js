const multer = require("multer");
const crypto = require("crypto");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

/* Cloudinary config */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

// Helper -> ساخت فولدر براساس تاریخ
const getDateFolder = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// تبدیل Buffer به Stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

const upload = (customFolder = null) => {
  const storage = multer.memoryStorage();
  const fileFilter = (req, file, cb) => cb(null, true);
  const multerInstance = multer({ storage, fileFilter });

  const cloudinaryUploadMiddleware = (fieldConfig) => async (req, res, next) => {
    multerInstance.fields(fieldConfig)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "File upload error" });
      }

      // ساخت مسیر ترکیبی: avatar/2025-09
      const baseFolder = customFolder
        ? `${customFolder}/${getDateFolder()}`
        : getDateFolder();

      req.uploadedFiles = {};

      try {
        const fileFields = Object.keys(req.files || {});
        for (const field of fileFields) {
          req.uploadedFiles[field] = [];
          for (const file of req.files[field]) {
            const hashedName = crypto.randomBytes(16).toString("hex");
            let extension = file.originalname.split(".").pop().toLowerCase();
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

            const result = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: baseFolder,
                  public_id: hashedName,
                  resource_type: "auto",
                },
                (error, uploadedResult) => {
                  if (error) reject(error);
                  else resolve(uploadedResult);
                }
              );

              bufferToStream(fileBuffer).pipe(uploadStream);
            });

            req.uploadedFiles[field].push({
              url: result.secure_url,
              public_id: result.public_id,
              key: result.public_id,
              format: result.format,
              resource_type: result.resource_type,
              storage: "cloudinary",
            });
          }
        }

        next();
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        res.status(500).json({
          acknowledgement: false,
          message: "Internal Server Error",
          description: `خطا در بارگذاری فایل‌ها به Cloudinary: ${error.message}`,
        });
      }
    });
  };

  return {
    single: (fieldName) =>
      cloudinaryUploadMiddleware([{ name: fieldName, maxCount: 1 }]),
    fields: (fieldsConfig) => cloudinaryUploadMiddleware(fieldsConfig),
  };
};

module.exports = upload;
