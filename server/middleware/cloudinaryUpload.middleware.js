const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const {
  getResourceType,
  generateBlurHash,
  makeImageVariant,
  makeObjectName,
  prepareFile,
} = require("../utils/uploadFile.util");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadBuffer = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    stream.end(buffer);
  });
};

const isSquareCardImage = (customFolder, field) => {
  const folder = String(customFolder || "").toLowerCase();
  return (
    (folder === "games" && ["cover", "dlcImages", "extraEditionImages"].includes(field)) ||
    (folder === "genres" && field === "image") ||
    (folder === "game-collections" && field === "image")
  );
};

const getPrepareOptions = (customFolder, field) =>
  isSquareCardImage(customFolder, field)
    ? { allowEnlargement: true, fit: "cover", resizeHeight: 1024, resizeWidth: 1024 }
    : {};

const uploadCloudinary = (customFolder = null) => {
  const multerInstance = multer({ storage: multer.memoryStorage() });

  const cloudinaryUploadMiddleware = (fieldConfig) => async (req, res, next) => {
    multerInstance.fields(fieldConfig)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "File upload error" });
      }

      req.uploadedFiles = {};

      try {
        const fileFields = Object.keys(req.files || {});

        for (const field of fileFields) {
          req.uploadedFiles[field] = [];

          for (const file of req.files[field]) {
            const prepareOptions = getPrepareOptions(customFolder, field);
            const { extension, fileBuffer, contentType } = await prepareFile(file, prepareOptions);
            const { key } = makeObjectName(customFolder, extension, req.body);
            const resourceType = getResourceType(contentType);
            const publicId = key.replace(/\.[^.]+$/, "");
            const blurHash = await generateBlurHash(file, extension);
            const mobileFile = isSquareCardImage(customFolder, field)
              ? await makeImageVariant(file, extension, { fit: "cover", resizeHeight: 640, resizeWidth: 640 })
              : null;
            const result = await uploadBuffer(fileBuffer, {
              public_id: publicId,
              resource_type: resourceType,
            });
            const mobileResult = mobileFile
              ? await uploadBuffer(mobileFile.fileBuffer, {
                  public_id: `${publicId}-mobile`,
                  resource_type: "image",
                })
              : null;

            req.uploadedFiles[field].push({
              url: result.secure_url,
              public_id: result.public_id,
              key: result.public_id,
              blur: blurHash
                ? {
                    hash: blurHash.hash,
                    width: blurHash.width,
                    height: blurHash.height,
                }
                : undefined,
              mobile: mobileResult
                ? {
                    url: mobileResult.secure_url,
                    public_id: mobileResult.public_id,
                    width: mobileFile.width,
                    height: mobileFile.height,
                  }
                : undefined,
              filename: `${result.public_id.split("/").pop()}.${result.format || extension}`,
              format: result.format || extension,
              resource_type: result.resource_type || resourceType,
              storage: "cloudinary",
            });
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    });
  };

  return {
    single: (fieldName) => cloudinaryUploadMiddleware([{ name: fieldName, maxCount: 1 }]),
    fields: (fieldsConfig) => cloudinaryUploadMiddleware(fieldsConfig),
  };
};

module.exports = uploadCloudinary;
