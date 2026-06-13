/* external import */
const express = require("express");

/* middleware imports */
const uploadArvan = require("../middleware/arvanUpload.middleware");
const verify = require("../middleware/verifyAdmin.middleware");

/* internal import */
const adminController = require("../controllers/admin.controller");
const authorize = require("../middleware/authorize.middleware");

/* router level connection */
const router = express.Router();

/* router methods integration */

// sign up an admin
router.post(
  "/sign-up",
  uploadArvan("avatar").single("avatar"),
  adminController.signUp
);

// sign in an admin
router.post("/sign-in", adminController.signIn);

// reset admin password
router.patch("/forgot-password", adminController.forgotPassword);

// login persistance
router.get("/me", verify,  adminController.persistLogin);

router.patch(
  "/profile",
  verify,
  uploadArvan("avatar").fields([
    { name: "avatar", maxCount: 1 },
    { name: "nationalCard", maxCount: 1 },
  ]),
  adminController.updateProfile
);

router.get(
  "/approvals",
  verify,
  authorize("owner"),
  adminController.getApprovals
);

router.patch(
  "/approvals/:type/:id/approve",
  verify,
  authorize("owner"),
  adminController.approveApproval
);

router.patch(
  "/approvals/:type/:id/reject",
  verify,
  authorize("owner"),
  adminController.rejectApproval
);

router.get(
  "/approval-messages",
  verify,
  authorize("owner", "superAdmin", "admin"),
  adminController.getApprovalMessages
);

// get all admins
router.get(
  "/all-admins",
  verify,
  authorize("owner", "superAdmin", "admin"),
  adminController.getAdmins
);

// get single admin
router.get(
  "/get-admin/:id",
  verify,
  authorize("owner", "superAdmin", "admin"),
  adminController.getAdmin
);

// update admin information
router.patch(
  "/update-information",
  verify,
  authorize("owner", "superAdmin", "admin"),
  uploadArvan("avatar").single("avatar"),
  adminController.updateAdmin
);

router.patch(
  "/update-admin/:id",
  verify,
  authorize("owner", "superAdmin", "admin"),
  uploadArvan("avatar").single("avatar"),
  adminController.updateAdminInfo
);

// delete admin information
router.delete(
  "/delete-admin/:id",
  verify,
  authorize("owner", "superAdmin", "admin"),
  adminController.deleteAdmin
);

/* export admin router */
module.exports = router;
