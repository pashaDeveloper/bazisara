const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const optionalVerifyAdmin = require("../middleware/optionalVerifyAdmin.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const controller = require("../controllers/gameCollection.controller");

const router = express.Router();
const access = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(3)];

router.get("/all", optionalVerifyAdmin, controller.getCollections);
router.patch("/reorder", ...access, controller.reorderCollections);
router.patch("/:id/visibility", ...access, controller.updateCollectionVisibility);
router.get("/:id", optionalVerifyAdmin, controller.getCollection);
router.post("/create", ...access, controller.createCollection);
router.patch("/:id", ...access, controller.updateCollection);
router.delete("/:id", ...access, controller.deleteCollection);

module.exports = router;
