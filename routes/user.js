const express = require('express');
const router = express.Router();
const Kid = require('../models/kid');
const Supporter = require('../models/supporter');
const Buyer = require('../models/buyer');
const authenticate = require('../middlewares/authentication');

router.get('/', authenticate, (req, res) => {
	res.json({ user: req.user, type: req.userType });
});

router.get('/:id', async (req, res) => {
	const user =
		(await Kid.findById({ _id: req.params.id })) ||
		(await Supporter.findById({ _id: req.params.id })) ||
		(await Buyer.findById({ _id: req.params.id }));
	res.status(200).send(user);
});

module.exports = router;
