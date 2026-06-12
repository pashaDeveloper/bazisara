const sliderService = require("../services/slider.service");

exports.createSlider = async (req, res, next) => {
  try {
    await sliderService.createSlider(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getSliders = async (req, res, next) => {
  try {
    await sliderService.getSliders(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getSlider = async (req, res, next) => {
  try {
    await sliderService.getSlider(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateSlider = async (req, res, next) => {
  try {
    await sliderService.updateSlider(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateSliderStatus = async (req, res, next) => {
  try {
    await sliderService.updateSliderStatus(req, res);
  } catch (error) {
    next(error);
  }
};

exports.reorderSliders = async (req, res, next) => {
  try {
    await sliderService.reorderSliders(req, res);
  } catch (error) {
    next(error);
  }
};

exports.deleteSlider = async (req, res, next) => {
  try {
    await sliderService.deleteSlider(req, res);
  } catch (error) {
    next(error);
  }
};
