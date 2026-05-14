const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const categoryFilterController = require("../controllers/categoryFilter.controller");

const router = express.Router();

router.get("/all", categoryFilterController.getCategoryFilters);
router.patch(
  "/reorder",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  categoryFilterController.reorderCategoryFilters
);
router.get("/:id", categoryFilterController.getCategoryFilter);

router.post(
  "/create",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  categoryFilterController.createCategoryFilter
);

router.patch(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  categoryFilterController.updateCategoryFilter
);

router.delete(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  categoryFilterController.deleteCategoryFilter
);

module.exports = router;
