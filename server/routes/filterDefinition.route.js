const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const filterDefinitionController = require("../controllers/filterDefinition.controller");

const router = express.Router();

router.get("/all", filterDefinitionController.getFilterDefinitions);
router.get("/:id", filterDefinitionController.getFilterDefinition);

router.post(
  "/create",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  requireAdminProfileLevel(2),
  filterDefinitionController.createFilterDefinition
);

router.patch(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  requireAdminProfileLevel(2),
  filterDefinitionController.updateFilterDefinition
);

router.delete(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  requireAdminProfileLevel(2),
  filterDefinitionController.deleteFilterDefinition
);

module.exports = router;
