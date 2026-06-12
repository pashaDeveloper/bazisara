const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const platformController = require("../controllers/platform.controller");

const router = express.Router();
const platformAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(2)];

router.get("/all", platformController.getPlatforms);
router.get("/:id", platformController.getPlatform);
router.post("/create", ...platformAccess, platformController.createPlatform);
router.patch("/:id", ...platformAccess, platformController.updatePlatform);
router.delete("/:id", ...platformAccess, platformController.deletePlatform);

module.exports = router;
