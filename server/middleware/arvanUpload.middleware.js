const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
  getResourceType,
  makeObjectName,
  prepareFile,
} = require("../utils/uploadFile.util");

const s3Client = new S3Client({
  endpoint: process.env.ARVAN_S3_ENDPOINT,
  region: process.env.ARVAN_S3_REGION || "us-east-1",
  forcePathStyle: process.env.ARVAN_S3_FORCE_PATH_STYLE !== "false",
  credentials: {
    accessKeyId: process.env.ARVAN_S3_ACCESS_KEY,
    secretAccessKey: process.env.ARVAN_S3_SECRET_KEY,
  },
});

const getPublicUrl = (key) => {
  const baseUrl = process.env.ARVAN_PUBLIC_BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
};

const uploadArvan = (customFolder = null) => {
  const multerInstance = multer({ storage: multer.memoryStorage() });

  const arvanUploadMiddleware = (fieldConfig) => async (req, res, next) => {
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
            const { extension, fileBuffer, contentType } = await prepareFile(file);
            const { filename, key } = makeObjectName(customFolder, extension);

            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.ARVAN_S3_BUCKET,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
              })
            );

            req.uploadedFiles[field].push({
              url: getPublicUrl(key),
              public_id: key,
              key,
              filename,
              format: extension,
              resource_type: getResourceType(contentType),
              storage: "arvan",
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
    single: (fieldName) => arvanUploadMiddleware([{ name: fieldName, maxCount: 1 }]),
    fields: (fieldsConfig) => arvanUploadMiddleware(fieldsConfig),
  };
};

module.exports = uploadArvan;
