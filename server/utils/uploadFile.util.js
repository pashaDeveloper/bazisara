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

const compressibleImageExtensions = new Set(["avif", "jpg", "jpeg", "jfif", "png", "webp"]);
const resizeWebpQuality = 88;
const blurPreviewQuality = 35;
const blurPreviewDisplayAmount = 12;
const compressionTargetRatio = 0.6;
const compressionQualities = [92, 90, 88, 86, 84, 82, 80, 78];
const defaultMaxImageDimension = 2560;

const folderAliases = {
  avatar: "profile",
  categories: "category",
  games: "game",
  "game-collections": "game-collection",
  genres: "genre",
  magazines: "magazine",
  platforms: "platform",
  products: "product",
  tags: "tag",
};

const makeBadRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const toFirstString = (value) => {
  if (Array.isArray(value)) return toFirstString(value[0]);
  if (typeof value === "string") return value.trim();
  if (value == null) return "";
  return String(value).trim();
};

const slugifyFolderSegment = (value) => {
  const segment = toFirstString(value)
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|#%{}^~[\]`]/g, "-")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return segment;
};

const getEntityTypeFolder = (customFolder, body = {}) => {
  const rawType = toFirstString(body.entityType || body.uploadType || customFolder || "uploads");
  const normalizedType = rawType.replace(/_/g, "-").toLowerCase();
  return folderAliases[normalizedType] || slugifyFolderSegment(normalizedType) || "uploads";
};

const getEntityName = (body = {}) => {
  return [
    body.entityName,
    body.uploadName,
    body.title,
    body.title_fa,
    body.title_en,
    body.name,
    body.name_fa,
    body.name_en,
    body.displayName,
    body.username,
    body.slug,
  ]
    .map(toFirstString)
    .find(Boolean);
};

const shouldRequireEntityName = (body = {}) => {
  return ["true", "1", "yes"].includes(toFirstString(body.requireEntityName).toLowerCase());
};

const getBaseFolder = (customFolder, body = {}) => {
  const typeFolder = getEntityTypeFolder(customFolder, body);
  const entityName = slugifyFolderSegment(getEntityName(body));

  if (entityName) return `${typeFolder}/${entityName}`;

  if (shouldRequireEntityName(body)) {
    throw makeBadRequest("Entity name is required before uploading files");
  }

  return typeFolder;
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
    withoutEnlargement: options.allowEnlargement === true ? false : true,
    width: Math.round(width),
  };
};

const shouldAutoResize = (metadata) => {
  return metadata.width > defaultMaxImageDimension || metadata.height > defaultMaxImageDimension;
};

const isAnimatedImage = (metadata) => metadata.pages && metadata.pages > 1;

const makeBlurPreview = async (file, extension) => {
  if (!compressibleImageExtensions.has(extension)) {
    return null;
  }

  const metadata = await sharp(file.buffer, { animated: true }).metadata();
  if (isAnimatedImage(metadata)) {
    return null;
  }

  const maxDimension = 64;
  const ratio = Math.min(1, maxDimension / Math.max(metadata.width || maxDimension, metadata.height || maxDimension));
  const width = Math.max(1, Math.round((metadata.width || maxDimension) * ratio));
  const height = Math.max(1, Math.round((metadata.height || maxDimension) * ratio));

  const fileBuffer = await sharp(file.buffer)
    .rotate()
    .resize({
      fit: "inside",
      height,
      width,
      withoutEnlargement: true,
    })
    .webp({
      alphaQuality: 55,
      effort: 5,
      quality: blurPreviewQuality,
      smartSubsample: true,
    })
    .toBuffer();

  return {
    contentType: "image/webp",
    extension: "webp",
    fileBuffer,
    height,
    quality: blurPreviewQuality,
    blurAmount: blurPreviewDisplayAmount,
    width,
  };
};

const makeImageVariant = async (file, extension, options = {}) => {
  if (!compressibleImageExtensions.has(extension)) {
    return null;
  }

  const metadata = await sharp(file.buffer, { animated: true }).metadata();
  if (isAnimatedImage(metadata)) {
    return null;
  }

  const width = Number(options.width || options.resizeWidth);
  const height = Number(options.height || options.resizeHeight);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  const fileBuffer = await sharp(file.buffer)
    .rotate()
    .resize({
      fit: ["contain", "cover", "fill", "inside", "outside"].includes(options.fit) ? options.fit : "cover",
      height: Math.round(height),
      position: "center",
      width: Math.round(width),
      withoutEnlargement: false,
    })
    .webp({
      alphaQuality: 80,
      effort: 6,
      quality: Number(options.quality) || resizeWebpQuality,
      smartSubsample: true,
    })
    .toBuffer();

  return {
    contentType: "image/webp",
    extension: "webp",
    fileBuffer,
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
  if (isAnimatedImage(metadata)) {
    return null;
  }

  return sharp(file.buffer)
    .rotate()
    .resize({
      fit: resizeOptions.fit,
      height: resizeOptions.height,
      position: "center",
      width: resizeOptions.width,
      withoutEnlargement: resizeOptions.withoutEnlargement,
    })
    .webp({
      alphaQuality: 80,
      effort: 6,
      quality: resizeWebpQuality,
      smartSubsample: true,
    })
    .toBuffer();
};

const pickCompressedBuffer = (buffers, originalSize) => {
  const usableBuffers = buffers.filter((buffer) => buffer && buffer.length < originalSize);
  if (!usableBuffers.length) {
    return null;
  }

  const targetSize = originalSize * compressionTargetRatio;
  const targetBuffer = usableBuffers
    .filter((buffer) => buffer.length <= targetSize)
    .sort((a, b) => b.length - a.length)[0];

  return targetBuffer || usableBuffers.sort((a, b) => a.length - b.length)[0];
};

const compressImage = async (file, extension) => {
  if (!compressibleImageExtensions.has(extension)) {
    return null;
  }

  const metadata = await sharp(file.buffer, { animated: true }).metadata();
  if (isAnimatedImage(metadata)) {
    return null;
  }

  const normalizedImage = sharp(file.buffer).rotate();
  const imagePipeline = () => {
    const pipeline = normalizedImage.clone();

    if (shouldAutoResize(metadata)) {
      return pipeline.resize({
        fit: "inside",
        height: defaultMaxImageDimension,
        width: defaultMaxImageDimension,
        withoutEnlargement: true,
      });
    }

    return pipeline;
  };

  const candidates = await Promise.all(
    [
      imagePipeline().webp({ lossless: true, effort: 6 }).toBuffer(),
      ...compressionQualities.map((quality) =>
        imagePipeline()
          .webp({
            alphaQuality: 80,
            effort: 6,
            quality,
            smartSubsample: true,
          })
          .toBuffer()
      ),
    ].map((task) => task.catch(() => null))
  );

  return pickCompressedBuffer(candidates, file.buffer.length);
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

const makeObjectName = (customFolder, extension, body = {}) => {
  const filename = `${crypto.randomBytes(16).toString("hex")}.${extension}`;
  const key = `${getBaseFolder(customFolder, body)}/${filename}`;

  return { filename, key };
};

const getResourceType = (mimetype) => {
  if (mimetype?.startsWith("video/")) return "video";
  if (mimetype?.startsWith("image/")) return "image";
  return "raw";
};

module.exports = {
  getResourceType,
  makeBlurPreview,
  makeImageVariant,
  makeObjectName,
  prepareFile,
};
