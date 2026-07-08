const uploadArvan = require("./arvanUpload.middleware");

const upload = (customFolder = null) => uploadArvan(customFolder);

module.exports = upload;
