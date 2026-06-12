const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const iconController = require("../controllers/icon.controller");

const router = express.Router();

router.get("/all", iconController.getIcons);
router.get("/:id", iconController.getIcon);

router.post(
  "/create",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  requireAdminProfileLevel(2),
  iconController.createIcon
);

router.patch(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  requireAdminProfileLevel(2),
  iconController.updateIcon
);

router.delete(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  requireAdminProfileLevel(2),
  iconController.deleteIcon
);

module.exports = router;
