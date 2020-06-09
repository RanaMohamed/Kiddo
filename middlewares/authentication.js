const Kid = require('../models/kid');
const Supporter = require('../models/supporter');
const Buyer = require('../models/buyer');

module.exports = async (req, res, next) => {
	try {
		let user;
		if (req.headers.authorization)
			user = await Kid.getKidFromToken(req.headers.authorization);

		if (!user)
			user = await Supporter.getSupporterFromToken(req.headers.authorization);

		if (!user) user = await Buyer.getBuyerFromToken(req.headers.authorization);

		if (!user) return res.status(401).json({ message: 'Unauthorized' });

		req.user = user;
		next();
	} catch (err) {
		next(err);
	}
};
