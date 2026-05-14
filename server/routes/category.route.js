const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const categoryController = require("../controllers/category.controller");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/all", categoryController.getCategories);
router.get("/tree", categoryController.getCategoryTree);
router.get("/:id", categoryController.getCategory);

router.post(
  "/create",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("categories").fields([{ name: "image", maxCount: 1 }]),
  categoryController.createCategory
);

router.patch(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("categories").fields([{ name: "image", maxCount: 1 }]),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  categoryController.deleteCategory
);

module.exports = router;
