module.exports = asyncRouter => async (req, res, next) => {
  try {
    await asyncRouter(req, res, next);
  } catch (err) {
    next(err);
  }
};
