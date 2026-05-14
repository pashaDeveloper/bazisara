const genreService = require("../services/genre.service");

exports.createGenre = async (req, res, next) => {
  try {
    await genreService.createGenre(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getGenres = async (req, res, next) => {
  try {
    await genreService.getGenres(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getGenre = async (req, res, next) => {
  try {
    await genreService.getGenre(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateGenre = async (req, res, next) => {
  try {
    await genreService.updateGenre(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteGenre = async (req, res, next) => {
  try {
    await genreService.deleteGenre(req, res);
  } catch (error) {
    next(error);
  }
};
