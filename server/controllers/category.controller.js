const categoryService = require("../services/category.service");

exports.createCategory = async (req, res, next) => {
  try {
    await categoryService.createCategory(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    await categoryService.getCategories(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getCategoryTree = async (req, res, next) => {
  try {
    await categoryService.getCategoryTree(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    await categoryService.getCategory(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    await categoryService.updateCategory(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req, res);
  } catch (error) {
    next(error);
  }
};
