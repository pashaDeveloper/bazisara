const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const gameController = require("../controllers/game.controller");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/all", gameController.getGames);
router.get("/:id", gameController.getGame);

router.post(
  "/create",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("games").fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 12 },
    { name: "trailerVideo", maxCount: 1 },
    { name: "gameplayVideo", maxCount: 1 },
  ]),
  gameController.createGame
);

router.patch(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("games").fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 12 },
    { name: "trailerVideo", maxCount: 1 },
    { name: "gameplayVideo", maxCount: 1 },
  ]),
  gameController.updateGame
);

router.delete(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  gameController.deleteGame
);

module.exports = router;
