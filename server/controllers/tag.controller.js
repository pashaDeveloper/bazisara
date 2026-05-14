const tagService = require("../services/tag.service");

exports.createTag = async (req, res, next) => {
  try {
    await tagService.createTag(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getTags = async (req, res, next) => {
  try {
    await tagService.getTags(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getTag = async (req, res, next) => {
  try {
    await tagService.getTag(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateTag = async (req, res, next) => {
  try {
    await tagService.updateTag(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    await tagService.deleteTag(req, res);
  } catch (error) {
    next(error);
  }
};
