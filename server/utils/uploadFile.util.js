const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");

const getDateFolder = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getBaseFolder = (customFolder) => {
  return customFolder ? `${customFolder}/${getDateFolder()}` : getDateFolder();
};

const prepareFile = async (file) => {
  const originalExtension = path.extname(file.originalname).replace(".", "").toLowerCase();
  let extension = originalExtension || "bin";
  let fileBuffer = file.buffer;
  let contentType = file.mimetype;

  if (["jpg", "jpeg", "png"].includes(extension)) {
    fileBuffer = await sharp(file.buffer)
      .toFormat("webp", {
        quality: 80,
        lossless: extension === "png",
      })
      .toBuffer();
    extension = "webp";
    contentType = "image/webp";
  }

  return { extension, fileBuffer, contentType };
};

const makeObjectName = (customFolder, extension) => {
  const filename = `${crypto.randomBytes(16).toString("hex")}.${extension}`;
  const key = `${getBaseFolder(customFolder)}/${filename}`;

  return { filename, key };
};

const getResourceType = (mimetype) => {
  if (mimetype?.startsWith("video/")) return "video";
  if (mimetype?.startsWith("image/")) return "image";
  return "raw";
};

module.exports = {
  getResourceType,
  makeObjectName,
  prepareFile,
};
