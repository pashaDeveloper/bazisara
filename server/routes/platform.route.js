const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const platformController = require("../controllers/platform.controller");
const upload = require("../middleware/upload.middleware");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const platformAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(2)];
const platformUploadFields = [{ name: "image", maxCount: 1 }];

router.get("/all", platformController.getPlatforms);
router.get("/:id", platformController.getPlatform);

registerStoragePost(
  router,
  "/create",
  platformAccess,
  "platforms",
  platformUploadFields,
  platformController.createPlatform
);

registerStoragePatch(
  router,
  "/:id",
  platformAccess,
  "platforms",
  platformUploadFields,
  platformController.updatePlatform
);

router.post("/create", ...platformAccess, upload("platforms").fields(platformUploadFields), platformController.createPlatform);
router.patch("/:id", ...platformAccess, upload("platforms").fields(platformUploadFields), platformController.updatePlatform);
router.delete("/:id", ...platformAccess, platformController.deletePlatform);

module.exports = router;
