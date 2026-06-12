const analyticsService = require("../services/analytics.service");

exports.trackPageView = async (req, res, next) => {
  try {
    await analyticsService.trackPageView(req, res);
  } catch (error) {
    next(error);
  }
};

exports.updateHeartbeat = async (req, res, next) => {
  try {
    await analyticsService.updateHeartbeat(req, res);
  } catch (error) {
    next(error);
  }
};

exports.trackEvent = async (req, res, next) => {
  try {
    await analyticsService.trackEvent(req, res);
  } catch (error) {
    next(error);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    await analyticsService.getSummary(req, res);
  } catch (error) {
    next(error);
  }
};
