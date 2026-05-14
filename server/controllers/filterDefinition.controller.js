const filterDefinitionService = require("../services/filterDefinition.service");

exports.createFilterDefinition = async (req, res, next) => {
  try {
    await filterDefinitionService.createFilterDefinition(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getFilterDefinitions = async (req, res, next) => {
  try {
    await filterDefinitionService.getFilterDefinitions(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getFilterDefinition = async (req, res, next) => {
  try {
    await filterDefinitionService.getFilterDefinition(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateFilterDefinition = async (req, res, next) => {
  try {
    await filterDefinitionService.updateFilterDefinition(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteFilterDefinition = async (req, res, next) => {
  try {
    await filterDefinitionService.deleteFilterDefinition(req, res);
  } catch (error) {
    next(error);
  }
};
