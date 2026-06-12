const uploadLocal = require("./localUpload.middleware");

const upload = (customFolder = null) => uploadLocal(customFolder);

module.exports = upload;
