const gameService = require("../services/game.service");

exports.createGame = async (req, res, next) => {
  try {
    await gameService.createGame(req, res);
  } catch (error) {
    next(error);
  }
};

exports.translateSearchTitleSlug = async (req, res, next) => {
  try {
    await gameService.translateSearchTitleSlug(req, res);
  } catch (error) {
    next(error);
  }
};

exports.translateIntro = async (req, res, next) => {
  try {
    await gameService.translateIntro(req, res);
  } catch (error) {
    next(error);
  }
};

exports.importScores = async (req, res, next) => {
  try {
    await gameService.importScores(req, res);
  } catch (error) {
    next(error);
  }
};

exports.importPsxHubDownloads = async (req, res, next) => {
  try {
    await gameService.importPsxHubDownloads(req, res);
  } catch (error) {
    next(error);
  }
};

exports.fetchXboxAchievements = async (req, res, next) => {
  try {
    await gameService.fetchXboxAchievements(req, res);
  } catch (error) {
    next(error);
  }
};

exports.fetchPlayStationTrophies = async (req, res, next) => {
  try {
    await gameService.fetchPlayStationTrophies(req, res);
  } catch (error) {
    next(error);
  }
};

exports.suggestGames = async (req, res, next) => {
  try {
    await gameService.suggestGames(req, res);
  } catch (error) {
    next(error);
  }
};

exports.suggestPlayStationGallery = async (req, res, next) => {
  try {
    await gameService.suggestPlayStationGallery(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getGames = async (req, res, next) => {
  try {
    await gameService.getGames(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getGame = async (req, res, next) => {
  try {
    await gameService.getGame(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateGame = async (req, res, next) => {
  try {
    await gameService.updateGame(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteGame = async (req, res, next) => {
  try {
    await gameService.deleteGame(req, res);
  } catch (error) {
    next(error);
  }
};
