module.exports = (req, res, next) => {
  const originalSend = res.send;
  
  let locale =
    req.headers["x-lang"] ||
    (req.headers["accept-language"]
      ? req.headers["accept-language"].split(",")[0].split("-")[0]
      : "fa");
  req.locale = locale;
  next();
};
