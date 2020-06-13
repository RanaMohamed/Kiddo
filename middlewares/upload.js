const multer = require("multer");
const path = require("path");
/** Storage Engine */
const storageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, fn) {
    fn(
      null,
      new Date().getTime().toString() + "-" + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storageEngine,
});
module.exports = upload;
