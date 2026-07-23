const express = require("express");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const upload = require("../middleware/upload.middleware");
const uploadArvan = require("../middleware/arvanUpload.middleware");

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

router.post(
  "/arvan/create",
  ...uploadAccess,
  uploadArvan("page-builder").fields([
    { name: "file", maxCount: 1 },
    { name: "upload", maxCount: 1 },
  ]),
  createUploadHandler
);

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
