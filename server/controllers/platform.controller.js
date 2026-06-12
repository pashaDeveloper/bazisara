const platformService = require("../services/platform.service");

exports.createPlatform = async (req, res, next) => {
  try {
    await platformService.createPlatform(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getPlatforms = async (req, res, next) => {
  try {
    await platformService.getPlatforms(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getPlatform = async (req, res, next) => {
  try {
    await platformService.getPlatform(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updatePlatform = async (req, res, next) => {
  try {
    await platformService.updatePlatform(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deletePlatform = async (req, res, next) => {
  try {
    await platformService.deletePlatform(req, res);
  } catch (error) {
    next(error);
  }
};
