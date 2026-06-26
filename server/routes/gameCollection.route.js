const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const optionalVerifyAdmin = require("../middleware/optionalVerifyAdmin.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const uploadArvan = require("../middleware/arvanUpload.middleware");
const controller = require("../controllers/gameCollection.controller");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const access = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(3)];
const collectionUploadFields = [{ name: "image", maxCount: 1 }];

router.get("/all", optionalVerifyAdmin, controller.getCollections);
router.patch("/reorder", ...access, controller.reorderCollections);
router.patch("/:id/visibility", ...access, controller.updateCollectionVisibility);
router.get("/:id", optionalVerifyAdmin, controller.getCollection);

registerStoragePost(
  router,
  "/create",
  access,
  "game-collections",
  collectionUploadFields,
  controller.createCollection
);

registerStoragePatch(
  router,
  "/:id",
  access,
  "game-collections",
  collectionUploadFields,
  controller.updateCollection
);

router.post(
  "/create",
  ...access,
  uploadArvan("game-collections").fields(collectionUploadFields),
  controller.createCollection
);

router.patch(
  "/:id",
  ...access,
  uploadArvan("game-collections").fields(collectionUploadFields),
  controller.updateCollection
);

router.delete("/:id", ...access, controller.deleteCollection);

module.exports = router;
