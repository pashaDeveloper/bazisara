const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const brandController = require("../controllers/brand.controller");
const upload = require("../middleware/upload.middleware");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const brandAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(2)];
const brandUploadFields = [{ name: "logo", maxCount: 1 }];

router.get("/all", brandController.getBrands);
router.get("/:id", brandController.getBrand);

registerStoragePost(router, "/create", brandAccess, "brands", brandUploadFields, brandController.createBrand);
registerStoragePatch(router, "/:id", brandAccess, "brands", brandUploadFields, brandController.updateBrand);

router.post("/create", ...brandAccess, upload("brands").fields(brandUploadFields), brandController.createBrand);
router.patch("/:id", ...brandAccess, upload("brands").fields(brandUploadFields), brandController.updateBrand);
router.delete("/:id", ...brandAccess, brandController.deleteBrand);

module.exports = router;
