const brandService = require("../services/brand.service");

exports.createBrand = async (req, res, next) => {
  try {
    await brandService.createBrand(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getBrands = async (req, res, next) => {
  try {
    await brandService.getBrands(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getBrand = async (req, res, next) => {
  try {
    await brandService.getBrand(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateBrand = async (req, res, next) => {
  try {
    await brandService.updateBrand(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteBrand = async (req, res, next) => {
  try {
    await brandService.deleteBrand(req, res);
  } catch (error) {
    next(error);
  }
};
