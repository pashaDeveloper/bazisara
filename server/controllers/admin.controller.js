/* internal imports */
const adminService = require("../services/admin.service");

/* sign up an admin */
exports.signUp = async (req, res, next) => {
  try {
    await adminService.signUp(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* sign in an admin */
exports.signIn = async (req, res, next) => {
  try {
    await adminService.signIn(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* reset admin password */
exports.forgotPassword = async (req, res, next) => {
  try {
    await adminService.forgotPassword(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* login persistance */
exports.persistLogin = async (req, res, next) => {
  try {
    await adminService.persistLogin(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* get all admins */
exports.getAdmins = async (req, res, next) => {
  try {
    await adminService.getAdmins(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* get single admin */
exports.getAdmin = async (req, res, next) => {
  try {
    await adminService.getAdmin(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* update admin information */
exports.updateAdmin = async (req, res, next) => {
  try {
    await adminService.updateAdmin(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* update admin information */
exports.updateAdminInfo = async (req, res, next) => {
  try {
    await adminService.updateAdminInfo(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* delete admin information */
exports.deleteAdmin = async (req, res, next) => {
  try {
    await adminService.deleteAdmin(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* seller request & approve */
exports.getSellers = async (req, res, next) => {
  try {
    await adminService.getSellers(res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

exports.reviewSeller = async (req, res, next) => {
  try {
    await adminService.reviewSeller(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};
