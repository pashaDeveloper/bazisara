const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
  getResourceType,
  makeObjectName,
  prepareFile,
} = require("../utils/uploadFile.util");

console.log("[ARVAN_UPLOAD] initializing S3 client", {
  endpoint: process.env.ARVAN_S3_ENDPOINT,
  region: process.env.ARVAN_S3_REGION || "us-east-1",
  bucket: process.env.ARVAN_S3_BUCKET,
  hasAccessKey: Boolean(process.env.ARVAN_S3_ACCESS_KEY),
  hasSecretKey: Boolean(process.env.ARVAN_S3_SECRET_KEY),
  forcePathStyle: process.env.ARVAN_S3_FORCE_PATH_STYLE !== "false",
});

const s3Client = new S3Client({
  endpoint: process.env.ARVAN_S3_ENDPOINT,
  region: process.env.ARVAN_S3_REGION || "us-east-1",
  forcePathStyle: process.env.ARVAN_S3_FORCE_PATH_STYLE !== "false",
  credentials: {
    accessKeyId: process.env.ARVAN_S3_ACCESS_KEY,
    secretAccessKey: process.env.ARVAN_S3_SECRET_KEY,
  },
});

const getObjectAcl = () => process.env.ARVAN_S3_ACL || "public-read";

const getPublicUrl = (key) => {
  const baseUrl = process.env.ARVAN_PUBLIC_BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
};

const uploadArvan = (customFolder = null) => {
  const multerInstance = multer({ storage: multer.memoryStorage() });

  const arvanUploadMiddleware = (fieldConfig) => async (req, res, next) => {
    multerInstance.fields(fieldConfig)(req, res, async (err) => {
      console.log("[ARVAN_UPLOAD] multer callback start", {
        fieldConfig,
        hasFiles: Boolean(req.files),
        fileKeys: req.files ? Object.keys(req.files) : [],
        bodyKeys: Object.keys(req.body || {}),
      });

      if (err) {
        console.error("[ARVAN_UPLOAD] multer error", err);
        return res.status(400).json({ error: err.message || "File upload error" });
      }

      req.uploadedFiles = {};

      try {
        const fileFields = Object.keys(req.files || {});

        for (const field of fileFields) {
          req.uploadedFiles[field] = [];

          for (const file of req.files[field]) {
            console.log("[ARVAN_UPLOAD] processing file", {
              field,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              customFolder,
            });

            const { extension, fileBuffer, contentType } = await prepareFile(file);
            const { filename, key } = makeObjectName(customFolder, extension);

            console.log("[ARVAN_UPLOAD] prepared file", {
              field,
              extension,
              contentType,
              filename,
              key,
              bufferLength: fileBuffer?.length,
            });

            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.ARVAN_S3_BUCKET,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
                ACL: getObjectAcl(),
              })
            );

            console.log("[ARVAN_UPLOAD] upload success", {
              field,
              key,
              url: getPublicUrl(key),
              bucket: process.env.ARVAN_S3_BUCKET,
            });

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
        console.error("[ARVAN_UPLOAD] upload failed", error);
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
