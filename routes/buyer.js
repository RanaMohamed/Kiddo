const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const validateRequest = require('../middlewares/validateRequest');
const Buyer = require('../models/Buyer');

router.post('/register', async (req, res) => {
	const { username, password, email, dateOfBirth, phone, address } = req.body;
	const buyer = new Buyer({
		username,
		password,
		email,
		dateOfBirth,
		phone,
		address,
	});

	await buyer.save();
	const token = await buyer.generateToken();

	res
		.status(201)
		.json({ message: 'Buyer registered successfully', buyer, token });
});

router.post(
	'/login',
	validateRequest([
		body('username').exists().withMessage('Username is required'),
		body('password').exists().withMessage('Password is required'),
	]),
	async (req, res) => {
		const { username, password } = req.body;
		const buyer = await Buyer.findOne({
			$or: [{ username: username }, { email: username }],
		});

		if (!buyer)
			return res.status(401).json({
				message: 'Invalid username or password',
				errors: { errors: { login: 'Invalid username or password' } },
			});

		const isMatched = await buyer.checkPassword(password);
		if (!isMatched)
			return res.status(403).json({
				message: 'Invalid username or password',
				errors: { errors: { login: 'Invalid username or password' } },
			});

		const token = await buyer.generateToken();
		res.json({ buyer, token });
	}
);

module.exports = router;
