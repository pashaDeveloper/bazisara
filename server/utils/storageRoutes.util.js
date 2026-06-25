const uploadCloudinary = require("../middleware/cloudinaryUpload.middleware");
const uploadArvan = require("../middleware/arvanUpload.middleware");

const storageUploaders = [
  { prefix: "/cloudinary", upload: uploadCloudinary },
  { prefix: "/arvan", upload: uploadArvan },
];

const registerStoragePost = (router, path, middlewares, folder, fields, handler) => {
  storageUploaders.forEach(({ prefix, upload }) => {
    router.post(`${prefix}${path}`, ...middlewares, upload(folder).fields(fields), handler);
  });
};

const registerStoragePatch = (router, path, middlewares, folder, fields, handler) => {
  storageUploaders.forEach(({ prefix, upload }) => {
    router.patch(`${prefix}${path}`, ...middlewares, upload(folder).fields(fields), handler);
  });
};

const registerStorageSinglePost = (router, path, middlewares, folder, field, handler) => {
  storageUploaders.forEach(({ prefix, upload }) => {
    router.post(`${prefix}${path}`, ...middlewares, upload(folder).single(field), handler);
  });
};

const registerStorageSinglePatch = (router, path, middlewares, folder, field, handler) => {
  storageUploaders.forEach(({ prefix, upload }) => {
    router.patch(`${prefix}${path}`, ...middlewares, upload(folder).single(field), handler);
  });
};

module.exports = {
  registerStoragePatch,
  registerStoragePost,
  registerStorageSinglePatch,
  registerStorageSinglePost,
};
