const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const tagController = require("../controllers/tag.controller");
const upload = require("../middleware/upload.middleware");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const tagAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(2)];
const tagUploadFields = [{ name: "image", maxCount: 1 }];

router.get("/all", tagController.getTags);
router.get("/:id", tagController.getTag);

registerStoragePost(
  router,
  "/create",
  tagAccess,
  "tags",
  tagUploadFields,
  tagController.createTag
);

registerStoragePatch(
  router,
  "/:id",
  tagAccess,
  "tags",
  tagUploadFields,
  tagController.updateTag
);

router.post(
  "/create",
  ...tagAccess,
  upload("tags").fields(tagUploadFields),
  tagController.createTag
);

router.patch(
  "/:id",
  ...tagAccess,
  upload("tags").fields(tagUploadFields),
  tagController.updateTag
);

router.delete(
  "/:id",
  ...tagAccess,
  tagController.deleteTag
);

module.exports = router;
