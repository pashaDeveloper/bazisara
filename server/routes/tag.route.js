const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const tagController = require("../controllers/tag.controller");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/all", tagController.getTags);
router.get("/:id", tagController.getTag);

router.post(
  "/create",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("tags").fields([{ name: "image", maxCount: 1 }]),
  tagController.createTag
);

router.patch(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("tags").fields([{ name: "image", maxCount: 1 }]),
  tagController.updateTag
);

router.delete(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  tagController.deleteTag
);

module.exports = router;
