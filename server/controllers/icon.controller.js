const iconService = require("../services/icon.service");

exports.createIcon = async (req, res, next) => {
  try {
    await iconService.createIcon(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getIcons = async (req, res, next) => {
  try {
    await iconService.getIcons(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getIcon = async (req, res, next) => {
  try {
    await iconService.getIcon(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateIcon = async (req, res, next) => {
  try {
    await iconService.updateIcon(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteIcon = async (req, res, next) => {
  try {
    await iconService.deleteIcon(req, res);
  } catch (error) {
    next(error);
  }
};
