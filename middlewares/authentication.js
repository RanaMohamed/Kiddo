const Kid = require('../models/kid');
const Supporter = require('../models/supporter');
const Buyer = require('../models/buyer');

module.exports = async (req, res, next) => {
	try {
		let user;
		let type;
		if (req.headers.authorization) {
			user = await Kid.getKidFromToken(req.headers.authorization);
			type = 'Kid';

			if (!user) {
				user = await Supporter.getSupporterFromToken(req.headers.authorization);
				type = 'Supporter';
			}

			if (!user) {
				user = await Buyer.getBuyerFromToken(req.headers.authorization);
				type = 'Buyer';
			}
		}

		if (!user) return res.status(401).json({ message: 'Unauthorized' });
		user.type = type;
		req.userType = type;
		req.user = user;
		next();
	} catch (err) {
		next(err);
	}
};
