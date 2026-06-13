const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const upload = require("../middleware/upload.middleware");
const { registerStoragePatch, registerStoragePost } = require("../utils/storageRoutes.util");

function createCatalogEntityRoute({ controller, storageFolder, uploadFields = [] }) {
  const router = express.Router();
  const access = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(2)];

  router.get("/all", controller.getAll);
  router.get("/:id", controller.getOne);

  registerStoragePost(router, "/create", access, storageFolder, uploadFields, controller.create);
  registerStoragePatch(router, "/:id", access, storageFolder, uploadFields, controller.update);

  router.post("/create", ...access, upload(storageFolder).fields(uploadFields), controller.create);
  router.patch("/:id", ...access, upload(storageFolder).fields(uploadFields), controller.update);
  router.delete("/:id", ...access, controller.remove);

  return router;
}

module.exports = createCatalogEntityRoute;
