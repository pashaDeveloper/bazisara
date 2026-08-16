const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { getResourceType, makeBlurPreview, makeImageVariant, prepareFile } = require("../utils/uploadFile.util");

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

const squareCardSize = 768;

const isSquareCardImage = (customFolder, field) => {
  const folder = String(customFolder || "").toLowerCase();
  return (
    (folder === "games" && ["cover", "dlcImages", "extraEditionImages"].includes(field)) ||
    (folder === "genres" && field === "image") ||
    (folder === "game-collections" && field === "image") ||
    (folder === "magazines" && field === "cardCover")
  );
};

const getPrepareOptions = (customFolder, field) =>
  isSquareCardImage(customFolder, field)
    ? { allowEnlargement: true, fit: "cover", resizeHeight: squareCardSize, resizeWidth: squareCardSize }
    : {};

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
            const prepareOptions = getPrepareOptions(customFolder, field);
            const { extension, fileBuffer, contentType } = await prepareFile(file, prepareOptions);
            const filename = `${hashedName}.${extension}`;
            const blurFile = await makeBlurPreview(file, extension);
            const mobileFile = isSquareCardImage(customFolder, field)
              ? await makeImageVariant(file, extension, { fit: "cover", resizeHeight: 640, resizeWidth: 640 })
              : null;
            const blurFilename = `${hashedName}-blur.webp`;
            const mobileFilename = `${hashedName}-mobile.webp`;
            const relativeFolder = baseFolder.split("/").filter(Boolean).join(path.sep);
            const destinationFolder = path.join(uploadRoot, relativeFolder);
            const filePath = path.join(destinationFolder, filename);
            const blurFilePath = path.join(destinationFolder, blurFilename);
            const mobileFilePath = path.join(destinationFolder, mobileFilename);
            const publicId = `${baseFolder}/${filename}`;
            const blurPublicId = `${baseFolder}/${blurFilename}`;
            const mobilePublicId = `${baseFolder}/${mobileFilename}`;
            const publicPath = publicId.split("/").map(encodeURIComponent).join("/");
            const blurPublicPath = blurPublicId.split("/").map(encodeURIComponent).join("/");
            const mobilePublicPath = mobilePublicId.split("/").map(encodeURIComponent).join("/");

            await fs.mkdir(destinationFolder, { recursive: true });
            await fs.writeFile(filePath, fileBuffer);
            if (blurFile) {
              await fs.writeFile(blurFilePath, blurFile.fileBuffer);
            }
            if (mobileFile) {
              await fs.writeFile(mobileFilePath, mobileFile.fileBuffer);
            }

            req.uploadedFiles[field].push({
              url: `${getBaseUrl(req)}/uploads/${publicPath}`,
              public_id: publicId,
              key: publicId,
              blur: blurFile
                ? {
                    hash: "",
                    width: blurFile.width,
                    height: blurFile.height,
                    quality: blurFile.quality,
                    blurAmount: blurFile.blurAmount,
                    url: blurFile ? `${getBaseUrl(req)}/uploads/${blurPublicPath}` : "",
                    public_id: blurPublicId,
                  }
                : undefined,
              mobile: mobileFile
                ? {
                    url: `${getBaseUrl(req)}/uploads/${mobilePublicPath}`,
                    public_id: mobilePublicId,
                    width: mobileFile.width,
                    height: mobileFile.height,
                  }
                : undefined,
              filename,
              path: filePath,
              format: extension,
              resource_type: getResourceType(contentType),
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
