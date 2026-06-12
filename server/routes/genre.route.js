const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const genreController = require("../controllers/genre.controller");
const upload = require("../middleware/upload.middleware");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const genreAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(2)];
const genreUploadFields = [{ name: "image", maxCount: 1 }];

router.get("/all", genreController.getGenres);
router.get("/:id", genreController.getGenre);

registerStoragePost(
  router,
  "/create",
  genreAccess,
  "genres",
  genreUploadFields,
  genreController.createGenre
);

registerStoragePatch(
  router,
  "/:id",
  genreAccess,
  "genres",
  genreUploadFields,
  genreController.updateGenre
);

router.post(
  "/create",
  ...genreAccess,
  upload("genres").fields(genreUploadFields),
  genreController.createGenre
);

router.patch(
  "/:id",
  ...genreAccess,
  upload("genres").fields(genreUploadFields),
  genreController.updateGenre
);

router.delete(
  "/:id",
  ...genreAccess,
  genreController.deleteGenre
);

module.exports = router;
