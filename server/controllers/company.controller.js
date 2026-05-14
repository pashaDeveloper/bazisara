const companyService = require("../services/company.service");

exports.createCompany = async (req, res, next) => {
  try {
    await companyService.createCompany(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getCompanies = async (req, res, next) => {
  try {
    await companyService.getCompanies(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getCompany = async (req, res, next) => {
  try {
    await companyService.getCompany(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    await companyService.updateCompany(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    await companyService.deleteCompany(req, res);
  } catch (error) {
    next(error);
  }
};
