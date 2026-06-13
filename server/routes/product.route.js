const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const optionalVerifyAdmin = require("../middleware/optionalVerifyAdmin.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const productController = require("../controllers/product.controller");
const upload = require("../middleware/upload.middleware");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const productAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(3)];
const productUploadFields = [
  { name: "image", maxCount: 1 },
  { name: "gallery", maxCount: 12 },
];

router.get("/all", optionalVerifyAdmin, productController.getProducts);
router.get("/:id", optionalVerifyAdmin, productController.getProduct);

registerStoragePost(
  router,
  "/create",
  productAccess,
  "products",
  productUploadFields,
  productController.createProduct
);

registerStoragePatch(
  router,
  "/:id",
  productAccess,
  "products",
  productUploadFields,
  productController.updateProduct
);

router.post(
  "/create",
  ...productAccess,
  upload("products").fields(productUploadFields),
  productController.createProduct
);

router.patch(
  "/:id",
  ...productAccess,
  upload("products").fields(productUploadFields),
  productController.updateProduct
);

router.delete(
  "/:id",
  ...productAccess,
  productController.deleteProduct
);

module.exports = router;
