

function authorize(...role) {
  return (req, res, next) => {
    // catch & match the admin role
    const adminRole = req.admin.role;

    // revoke access based on role
    if (!role.includes(adminRole)) {
      return res.status(403).json({
        acknowledgement: false,
        message: "ممنوع",
        description: "شما مجاز به دسترسی به این صفحه نیستید",
      });
    }

    next();
  };
}

module.exports = authorize;
