const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
  getResourceType,
  makeObjectName,
  prepareFile,
} = require("../utils/uploadFile.util");

const normalizeEndpoint = (endpoint) => {
  if (!endpoint) return endpoint;
  return /^https?:\/\//i.test(endpoint) ? endpoint : `https://${endpoint}`;
};

const getEndpoint = () => normalizeEndpoint(process.env.PARSPACK_S3_ENDPOINT);
const getBucket = () => process.env.PARSPACK_S3_BUCKET;
const getObjectAcl = () => process.env.PARSPACK_S3_ACL || "public-read";

console.log("[PARSPACK_UPLOAD] initializing S3 client", {
  endpoint: getEndpoint(),
  region: process.env.PARSPACK_S3_REGION || "us-east-1",
  bucket: getBucket(),
  hasAccessKey: Boolean(process.env.PARSPACK_S3_ACCESS_KEY),
  hasSecretKey: Boolean(process.env.PARSPACK_S3_SECRET_KEY),
  forcePathStyle: process.env.PARSPACK_S3_FORCE_PATH_STYLE !== "false",
});

const s3Client = new S3Client({
  endpoint: getEndpoint(),
  region: process.env.PARSPACK_S3_REGION || "us-east-1",
  forcePathStyle: process.env.PARSPACK_S3_FORCE_PATH_STYLE !== "false",
  credentials: {
    accessKeyId: process.env.PARSPACK_S3_ACCESS_KEY,
    secretAccessKey: process.env.PARSPACK_S3_SECRET_KEY,
  },
});

const getPublicUrl = (key) => {
  const baseUrl = normalizeEndpoint(process.env.PARSPACK_PUBLIC_BASE_URL || process.env.PARSPACK_S3_ENDPOINT);
  return `${baseUrl.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
};

const uploadParspack = (customFolder = null) => {
  const multerInstance = multer({ storage: multer.memoryStorage() });

  const parspackUploadMiddleware = (fieldConfig) => async (req, res, next) => {
    multerInstance.fields(fieldConfig)(req, res, async (err) => {
      console.log("[PARSPACK_UPLOAD] multer callback start", {
        fieldConfig,
        hasFiles: Boolean(req.files),
        fileKeys: req.files ? Object.keys(req.files) : [],
        bodyKeys: Object.keys(req.body || {}),
      });

      if (err) {
        console.error("[PARSPACK_UPLOAD] multer error", err);
        return res.status(400).json({ error: err.message || "File upload error" });
      }

      req.uploadedFiles = {};

      try {
        const fileFields = Object.keys(req.files || {});

        for (const field of fileFields) {
          req.uploadedFiles[field] = [];

          for (const file of req.files[field]) {
            console.log("[PARSPACK_UPLOAD] processing file", {
              field,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              customFolder,
            });

            const { extension, fileBuffer, contentType } = await prepareFile(file);
            const { filename, key } = makeObjectName(customFolder, extension);

            await s3Client.send(
              new PutObjectCommand({
                Bucket: getBucket(),
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
                ACL: getObjectAcl(),
              })
            );

            console.log("[PARSPACK_UPLOAD] upload success", {
              field,
              key,
              url: getPublicUrl(key),
              bucket: getBucket(),
            });

            req.uploadedFiles[field].push({
              url: getPublicUrl(key),
              public_id: key,
              key,
              filename,
              format: extension,
              resource_type: getResourceType(contentType),
              storage: "parspack",
            });
          }
        }

        next();
      } catch (error) {
        console.error("[PARSPACK_UPLOAD] upload failed", error);
        next(error);
      }
    });
  };

  return {
    single: (fieldName) => parspackUploadMiddleware([{ name: fieldName, maxCount: 1 }]),
    fields: (fieldsConfig) => parspackUploadMiddleware(fieldsConfig),
  };
};

module.exports = uploadParspack;
