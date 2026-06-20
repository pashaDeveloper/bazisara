const service = require("../services/gameCollection.service");

exports.createCollection = async (req, res, next) => {
  try {
    await service.createCollection(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getCollections = async (req, res, next) => {
  try {
    await service.getCollections(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getCollection = async (req, res, next) => {
  try {
    await service.getCollection(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateCollection = async (req, res, next) => {
  try {
    await service.updateCollection(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateCollectionVisibility = async (req, res, next) => {
  try {
    await service.updateCollectionVisibility(req, res);
  } catch (error) {
    next(error);
  }
};

exports.reorderCollections = async (req, res, next) => {
  try {
    await service.reorderCollections(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteCollection = async (req, res, next) => {
  try {
    await service.deleteCollection(req, res);
  } catch (error) {
    next(error);
  }
};
