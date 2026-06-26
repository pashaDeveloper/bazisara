const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const upload = require("../middleware/upload.middleware");
const controller = require("../controllers/gameKeyword.controller");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const access = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(2)];
const uploadFields = [{ name: "image", maxCount: 1 }];

router.get("/all", controller.getKeywords);
router.get("/:id", controller.getKeyword);

registerStoragePost(router, "/create", access, "game-keywords", uploadFields, controller.createKeyword);
registerStoragePatch(router, "/:id", access, "game-keywords", uploadFields, controller.updateKeyword);

router.post("/create", ...access, upload("game-keywords").fields(uploadFields), controller.createKeyword);
router.patch("/:id", ...access, upload("game-keywords").fields(uploadFields), controller.updateKeyword);
router.delete("/:id", ...access, controller.deleteKeyword);

module.exports = router;
