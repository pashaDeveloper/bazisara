const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const companyController = require("../controllers/company.controller");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/all", companyController.getCompanies);
router.get("/:id", companyController.getCompany);

router.post(
  "/create",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("companies").fields([{ name: "logo", maxCount: 1 }]),
  companyController.createCompany
);

router.patch(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("companies").fields([{ name: "logo", maxCount: 1 }]),
  companyController.updateCompany
);

router.delete(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  companyController.deleteCompany
);

module.exports = router;
