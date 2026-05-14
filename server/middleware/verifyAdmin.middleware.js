

/* external imports */
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

async function verifyAdmin(req, res, next) {
  try {
    // catch the token from admin header
    const token = req.headers?.authorization?.split(" ")[1];

    // no token explicitly give error
    if (!token) {
      return res.status(401).json({
        acknowledgement: false,
        message: "Unauthorized",
        description: "توکنی برای نگه‌داری کاربر موجود برای مدت طولانی یافت نشد",
      });
    }

    // fetching token set the admin on request
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.TOKEN_SECRET
    );
    req.admin = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      acknowledgement: false,
      message: "Unauthorized",
      description: "لطفا  وارد حساب کاربری خود شوید",
    });
  }
}

/* export token verification */
module.exports = verifyAdmin;
