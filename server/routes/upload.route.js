const express = require("express");
const axios = require("axios");
const { S3Client, DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const upload = require("../middleware/upload.middleware");
const uploadArvan = require("../middleware/arvanUpload.middleware");
const {
  generateBlurHash,
  getResourceType,
  makeObjectName,
  prepareFile,
} = require("../utils/uploadFile.util");

const router = express.Router();
const uploadAccess = [verify, authorize("owner", "superAdmin", "admin", "operator")];

const arvanS3Client = new S3Client({
  endpoint: process.env.ARVAN_S3_ENDPOINT,
  region: process.env.ARVAN_S3_REGION || "us-east-1",
  forcePathStyle: process.env.ARVAN_S3_FORCE_PATH_STYLE !== "false",
  credentials: {
    accessKeyId: process.env.ARVAN_S3_ACCESS_KEY,
    secretAccessKey: process.env.ARVAN_S3_SECRET_KEY,
  },
});

const makeBlurPublicId = (publicId) => publicId.replace(/\.[^.]+$/, "-blur.webp");
const makeMobilePublicId = (publicId) => publicId.replace(/\.[^.]+$/, "-mobile.webp");
const makeBlurPublicUrl = (key) => key.replace(/\.[^.]+$/, "-blur.webp");

const getObjectAcl = () => process.env.ARVAN_S3_ACL || "public-read";

const getPublicUrl = (key) => {
  const baseUrl = process.env.ARVAN_PUBLIC_BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
};

const createUploadHandler = (req, res) => {
  const file = req.uploadedFiles?.file?.[0] || req.uploadedFiles?.upload?.[0];

  if (!file) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "No file was sent for upload",
    });
  }

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "File uploaded successfully",
    url: file.url,
    default: file.url,
    data: file,
  });
};

const requirePublicId = (req, res) => {
  const { public_id } = req.body || {};

  if (public_id) return public_id;

  res.status(400).json({
    acknowledgement: false,
    message: "Bad Request",
    description: "File public_id is required",
  });

  return null;
};

const deleteArvanHandler = async (req, res, next) => {
  try {
    const publicId = requirePublicId(req, res);
    if (!publicId) return;

    await arvanS3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.ARVAN_S3_BUCKET,
        Key: publicId,
      })
    );
    await arvanS3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.ARVAN_S3_BUCKET,
        Key: makeBlurPublicId(publicId),
      })
    ).catch(() => null);
    await arvanS3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.ARVAN_S3_BUCKET,
        Key: makeMobilePublicId(publicId),
      })
    ).catch(() => null);

    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const createRemoteArvanHandler = async (req, res, next) => {
  try {
    const sourceUrl = String(req.body?.sourceUrl || req.body?.url || "").trim();
    if (!/^https?:\/\//i.test(sourceUrl)) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Bad Request",
        description: "Valid sourceUrl is required",
      });
    }

    const response = await axios.get(sourceUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0",
      },
      maxContentLength: 25 * 1024 * 1024,
      responseType: "arraybuffer",
      timeout: 20000,
    });

    const contentType = String(response.headers?.["content-type"] || "image/jpeg").split(";")[0].trim();
    if (!contentType.startsWith("image/")) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Bad Request",
        description: "sourceUrl must point to an image",
      });
    }

    const originalExtension = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const file = {
      buffer: Buffer.from(response.data),
      mimetype: contentType,
      originalname: `remote-image.${originalExtension}`,
      size: Number(response.headers?.["content-length"]) || Buffer.byteLength(response.data),
    };

    const { extension, fileBuffer, contentType: preparedContentType } = await prepareFile(file, req.body || {});
    const { filename, key } = makeObjectName("page-builder", extension, req.body);
    const blurHash = await generateBlurHash(file, extension);
    const blurKey = blurHash ? makeBlurPublicUrl(key) : "";

    await arvanS3Client.send(
      new PutObjectCommand({
        ACL: getObjectAcl(),
        Body: fileBuffer,
        Bucket: process.env.ARVAN_S3_BUCKET,
        ContentType: preparedContentType,
        Key: key,
      })
    );

    const uploadedFile = {
      blur: blurHash
        ? {
            hash: blurHash.hash,
            height: blurHash.height,
            public_id: blurKey,
            url: "",
            width: blurHash.width,
          }
        : undefined,
      filename,
      format: extension,
      key,
      original_size: file.size,
      public_id: key,
      resource_type: getResourceType(preparedContentType),
      size: fileBuffer.length,
      storage: "arvan",
      url: getPublicUrl(key),
    };

    res.status(201).json({
      acknowledgement: true,
      data: uploadedFile,
      default: uploadedFile.url,
      description: "Remote image uploaded successfully",
      message: "Created",
      url: uploadedFile.url,
    });
  } catch (error) {
    next(error);
  }
};

router.post(
  "/arvan/create",
  ...uploadAccess,
  uploadArvan("page-builder").fields([
    { name: "file", maxCount: 1 },
    { name: "upload", maxCount: 1 },
  ]),
  createUploadHandler
);

router.post("/arvan/create-remote", ...uploadAccess, createRemoteArvanHandler);

router.delete("/arvan/delete", ...uploadAccess, deleteArvanHandler);

router.post(
  "/create",
  ...uploadAccess,
  upload("page-builder").fields([
    { name: "file", maxCount: 1 },
    { name: "upload", maxCount: 1 },
  ]),
  createUploadHandler
);

router.delete("/delete", ...uploadAccess, deleteArvanHandler);

module.exports = router;
