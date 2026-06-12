const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const companyController = require("../controllers/company.controller");
const upload = require("../middleware/upload.middleware");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const companyAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(2)];
const companyUploadFields = [{ name: "logo", maxCount: 1 }];

router.get("/all", companyController.getCompanies);
router.get("/:id", companyController.getCompany);

registerStoragePost(
  router,
  "/create",
  companyAccess,
  "companies",
  companyUploadFields,
  companyController.createCompany
);

registerStoragePatch(
  router,
  "/:id",
  companyAccess,
  "companies",
  companyUploadFields,
  companyController.updateCompany
);

router.post(
  "/create",
  ...companyAccess,
  upload("companies").fields(companyUploadFields),
  companyController.createCompany
);

router.patch(
  "/:id",
  ...companyAccess,
  upload("companies").fields(companyUploadFields),
  companyController.updateCompany
);

router.delete(
  "/:id",
  ...companyAccess,
  companyController.deleteCompany
);

module.exports = router;
