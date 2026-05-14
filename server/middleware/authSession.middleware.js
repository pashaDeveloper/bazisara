const jwt = require("jsonwebtoken");
const { promisify } = require("util");

async function authSession(req, res, next) {
  try {

    let userId;
    let userRole;

    // اگر توکن در هدر باشد
    const token = req.headers?.authorization?.split(" ")[1];
    console.log("token",token)
    if (req.sessionData) {
      console.log("session", req.sessionData);
      userRole = req.sessionData.role;
    } else if (token) {
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.TOKEN_SECRET
      );
      req.user = decoded;
      userId = decoded._id;
      userRole = decoded.role;
      if (!userId) {
        return res.status(401).json({
          acknowledgement: false,
          message: "Unauthorized",
          description: "توکن یا session معتبر یافت نشد",
        });
      }
     
    }
    
    req.user = { _id: userId, role: userRole }; 

    

    next();
  } catch (error) {
    res.status(401).json({
      acknowledgement: false,
      message: "Unauthorized",
      description: "لطفا وارد حساب کاربری خود شوید"
    });
  }
}

module.exports = authSession;
