const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const optionalVerifyAdmin = require("../middleware/optionalVerifyAdmin.middleware");
const requireAdminProfileLevel = require("../middleware/adminProfileLevel.middleware");
const gameController = require("../controllers/game.controller");
const upload = require("../middleware/upload.middleware");
const {
  registerStoragePatch,
  registerStoragePost,
} = require("../utils/storageRoutes.util");

const router = express.Router();
const gameAccess = [verify, authorize("owner", "superAdmin", "admin", "operator"), requireAdminProfileLevel(3)];
const gameUploadFields = [
  { name: "cover", maxCount: 1 },
  { name: "cardDesktopCover", maxCount: 1 },
  { name: "cardMobileCover", maxCount: 1 },
  { name: "desktopCover", maxCount: 1 },
  { name: "mobileCover", maxCount: 1 },
  { name: "gallery", maxCount: 12 },
  { name: "trailerVideo", maxCount: 1 },
  { name: "trailerThumbnail", maxCount: 1 },
  { name: "gameplayVideo", maxCount: 1 },
  { name: "gameplayThumbnail", maxCount: 1 },
  { name: "patchImage", maxCount: 1 },
  { name: "dlcImages", maxCount: 20 },
  { name: "extraEditionImages", maxCount: 20 },
];

router.get("/all", optionalVerifyAdmin, gameController.getGames);
router.get("/:id", optionalVerifyAdmin, gameController.getGame);

registerStoragePost(
  router,
  "/create",
  gameAccess,
  "games",
  gameUploadFields,
  gameController.createGame
);

registerStoragePatch(
  router,
  "/:id",
  gameAccess,
  "games",
  gameUploadFields,
  gameController.updateGame
);

router.post(
  "/create",
  ...gameAccess,
  upload("games").fields(gameUploadFields),
  gameController.createGame
);

router.patch(
  "/:id",
  ...gameAccess,
  upload("games").fields(gameUploadFields),
  gameController.updateGame
);

router.delete(
  "/:id",
  ...gameAccess,
  gameController.deleteGame
);

module.exports = router;
