const service = require("../services/gameKeyword.service");

exports.createKeyword = async (req, res, next) => {
  try {
    await service.createKeyword(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getKeywords = async (req, res, next) => {
  try {
    await service.getKeywords(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getKeyword = async (req, res, next) => {
  try {
    await service.getKeyword(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateKeyword = async (req, res, next) => {
  try {
    await service.updateKeyword(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteKeyword = async (req, res, next) => {
  try {
    await service.deleteKeyword(req, res);
  } catch (error) {
    next(error);
  }
};
