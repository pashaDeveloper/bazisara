const gameService = require("../services/game.service");

exports.createGame = async (req, res, next) => {
  try {
    await gameService.createGame(req, res);
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
