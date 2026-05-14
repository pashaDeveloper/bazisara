const express = require("express");
const verify = require("../middleware/verifyAdmin.middleware");
const authorize = require("../middleware/authorize.middleware");
const genreController = require("../controllers/genre.controller");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/all", genreController.getGenres);
router.get("/:id", genreController.getGenre);

router.post(
  "/create",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("genres").fields([{ name: "image", maxCount: 1 }]),
  genreController.createGenre
);

router.patch(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  upload("genres").fields([{ name: "image", maxCount: 1 }]),
  genreController.updateGenre
);

router.delete(
  "/:id",
  verify,
  authorize("owner", "superAdmin", "admin", "operator"),
  genreController.deleteGenre
);

module.exports = router;
