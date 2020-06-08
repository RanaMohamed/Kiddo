const Kid = require("../models/kid");

module.exports = async (req, res, next) => {
  try {
    const autherization = req.headers.autherization;
    if (!autherization)
      throw new Error("Autherzation required token not provide");
    req.kid = await Kid.getKidFromToken(autherization);
    if (!req.kid) throw new Error("Autherzation required");
    next();
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};
