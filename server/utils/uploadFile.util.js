const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");

const imageContentTypes = {
  avif: "image/avif",
  jfif: "image/jpeg",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const compressibleImageExtensions = new Set(["jpg", "jpeg", "jfif", "png", "webp"]);

const getDateFolder = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getBaseFolder = (customFolder) => {
  return customFolder ? `${customFolder}/${getDateFolder()}` : getDateFolder();
};

const getOriginalExtension = (file) => {
  const filenameExtension = path.extname(file.originalname).replace(".", "").toLowerCase();

  if (filenameExtension) return filenameExtension;
  if (file.mimetype === "image/jpeg") return "jpg";
  if (file.mimetype === "image/png") return "png";
  if (file.mimetype === "image/webp") return "webp";
  if (file.mimetype === "image/avif") return "avif";

  return "bin";
};

const normalizeResizeOptions = (options = {}) => {
  const width = Number(options.width || options.resizeWidth);
  const height = Number(options.height || options.resizeHeight);

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return {
    fit: ["contain", "cover", "fill", "inside", "outside"].includes(options.fit) ? options.fit : "cover",
    height: Math.round(height),
    width: Math.round(width),
  };
};

const resizeImage = async (file, extension, options) => {
  const resizeOptions = normalizeResizeOptions(options);
  if (!resizeOptions || !compressibleImageExtensions.has(extension)) {
    return null;
  }

  const metadata = await sharp(file.buffer, { animated: true }).metadata();
  if (metadata.pages && metadata.pages > 1) {
    return null;
  }

  return sharp(file.buffer)
    .rotate()
    .resize({
      fit: resizeOptions.fit,
      height: resizeOptions.height,
      position: "center",
      width: resizeOptions.width,
    })
    .webp({
      effort: 6,
      quality: 92,
      smartSubsample: true,
    })
    .toBuffer();
};

const compressImage = async (file, extension) => {
  if (!compressibleImageExtensions.has(extension)) {
    return null;
  }

  const metadata = await sharp(file.buffer, { animated: true }).metadata();
  if (metadata.pages && metadata.pages > 1) {
    return null;
  }

  const normalizedImage = sharp(file.buffer).rotate();
  const candidates = await Promise.all(
    [
      normalizedImage.clone().webp({ lossless: true, effort: 6 }).toBuffer(),
      normalizedImage
        .clone()
        .webp({
          effort: 6,
          quality: 92,
          smartSubsample: true,
        })
        .toBuffer(),
    ].map((task) => task.catch(() => null))
  );

  return candidates
    .filter((buffer) => buffer && buffer.length < file.buffer.length)
    .sort((a, b) => a.length - b.length)[0] || null;
};

const prepareFile = async (file, options = {}) => {
  const originalExtension = getOriginalExtension(file);
  let extension = originalExtension;
  let fileBuffer = file.buffer;
  let contentType = file.mimetype || imageContentTypes[extension] || "application/octet-stream";

  const resizedBuffer = await resizeImage(file, extension, options);

  if (resizedBuffer) {
    fileBuffer = resizedBuffer;
    extension = "webp";
    contentType = "image/webp";
    return { extension, fileBuffer, contentType };
  }

  const compressedBuffer = await compressImage(file, extension);

  if (compressedBuffer && compressedBuffer.length < file.buffer.length) {
    fileBuffer = compressedBuffer;
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
