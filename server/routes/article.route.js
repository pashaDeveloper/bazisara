const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const optionalVerifyAdmin = require("../middleware/optionalVerifyAdmin.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const articleController = require("../controllers/article.controller");
const uploadArvan = require("../middleware/arvanUpload.middleware");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const articleAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(3)];
const articleUploadFields = [{ name: "cover", maxCount: 1 }];

router.get("/all", optionalVerifyAdmin, articleController.getArticles);
router.get("/:id", optionalVerifyAdmin, articleController.getArticle);

router.post("/slug", ...articleAccess, articleController.generateArticleSlug);

registerStoragePost(
  router,
  "/create",
  articleAccess,
  "articles",
  articleUploadFields,
  articleController.createArticle
);

registerStoragePatch(
  router,
  "/:id",
  articleAccess,
  "articles",
  articleUploadFields,
  articleController.updateArticle
);

router.post(
  "/create",
  ...articleAccess,
  uploadArvan("articles").fields(articleUploadFields),
  articleController.createArticle
);

router.patch(
  "/:id",
  ...articleAccess,
  uploadArvan("articles").fields(articleUploadFields),
  articleController.updateArticle
);

router.delete(
  "/:id",
  ...articleAccess,
  articleController.deleteArticle
);

module.exports = router;
