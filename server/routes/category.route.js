const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const categoryController = require("../controllers/category.controller");
const uploadArvan = require("../middleware/arvanUpload.middleware");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const categoryAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(2)];
const categoryUploadFields = [{ name: "image", maxCount: 1 }];

router.get("/all", categoryController.getCategories);
router.get("/tree", categoryController.getCategoryTree);
router.get("/:id", categoryController.getCategory);

registerStoragePost(
  router,
  "/create",
  categoryAccess,
  "categories",
  categoryUploadFields,
  categoryController.createCategory
);

registerStoragePatch(
  router,
  "/:id",
  categoryAccess,
  "categories",
  categoryUploadFields,
  categoryController.updateCategory
);

router.post(
  "/create",
  ...categoryAccess,
  uploadArvan("categories").fields(categoryUploadFields),
  categoryController.createCategory
);

router.patch(
  "/:id",
  ...categoryAccess,
  uploadArvan("categories").fields(categoryUploadFields),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  ...categoryAccess,
  categoryController.deleteCategory
);

module.exports = router;
