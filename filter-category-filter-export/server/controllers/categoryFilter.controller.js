const categoryFilterService = require("../services/categoryFilter.service");

exports.createCategoryFilter = async (req, res, next) => {
  try {
    await categoryFilterService.createCategoryFilter(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getCategoryFilters = async (req, res, next) => {
  try {
    await categoryFilterService.getCategoryFilters(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getCategoryFilter = async (req, res, next) => {
  try {
    await categoryFilterService.getCategoryFilter(req, res);
  } catch (error) {
    next(error);
  }
};

exports.reorderCategoryFilters = async (req, res, next) => {
  try {
    await categoryFilterService.reorderCategoryFilters(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateCategoryFilter = async (req, res, next) => {
  try {
    await categoryFilterService.updateCategoryFilter(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategoryFilter = async (req, res, next) => {
  try {
    await categoryFilterService.deleteCategoryFilter(req, res);
  } catch (error) {
    next(error);
  }
};
