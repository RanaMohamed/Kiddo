module.exports = (type) => async (req, res, next) => {
	if (!req.user || req.user.type !== type) {
		res.status(403).json({ message: 'Unauthorized' });
		next({ message: 'Unauthorized' });
	}
	next();
};
