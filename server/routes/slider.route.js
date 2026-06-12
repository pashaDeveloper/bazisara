const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const optionalVerifyAdmin = require("../middleware/optionalVerifyAdmin.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const sliderController = require("../controllers/slider.controller");
const upload = require("../middleware/upload.middleware");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const sliderAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(3)];
const sliderUploadFields = [{ name: "image", maxCount: 1 }];

router.get("/all", optionalVerifyAdmin, sliderController.getSliders);
router.patch("/reorder", ...sliderAccess, sliderController.reorderSliders);
router.patch("/:id/status", verify, authorize("owner", "superAdmin", "admin", "operator"), sliderController.updateSliderStatus);
router.get("/:id", optionalVerifyAdmin, sliderController.getSlider);

registerStoragePost(
  router,
  "/create",
  sliderAccess,
  "sliders",
  sliderUploadFields,
  sliderController.createSlider
);

registerStoragePatch(
  router,
  "/:id",
  sliderAccess,
  "sliders",
  sliderUploadFields,
  sliderController.updateSlider
);

router.post(
  "/create",
  ...sliderAccess,
  upload("sliders").fields(sliderUploadFields),
  sliderController.createSlider
);

router.patch(
  "/:id",
  ...sliderAccess,
  upload("sliders").fields(sliderUploadFields),
  sliderController.updateSlider
);

router.delete(
  "/:id",
  ...sliderAccess,
  sliderController.deleteSlider
);

module.exports = router;
