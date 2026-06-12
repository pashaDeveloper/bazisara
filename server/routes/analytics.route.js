const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const analyticsController = require("../controllers/analytics.controller");

const router = express.Router();
const dashboardAccess = [verify, authorize("owner", "superAdmin", "admin", "operator")];

router.post("/pageview", analyticsController.trackPageView);
router.patch("/heartbeat", analyticsController.updateHeartbeat);
router.post("/event", analyticsController.trackEvent);
router.get("/summary", ...dashboardAccess, analyticsController.getSummary);

module.exports = router;
