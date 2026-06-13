const productService = require("../services/product.service");

exports.createProduct = async (req, res, next) => {
  try {
    await productService.createProduct(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    await productService.getProducts(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    await productService.getProduct(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    await productService.updateProduct(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req, res);
  } catch (error) {
    next(error);
  }
};
