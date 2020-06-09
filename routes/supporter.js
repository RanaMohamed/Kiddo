const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const validateRequest = require('../middlewares/validateRequest');
const Supporter = require('../models/Supporter');

router.post('/register', async (req, res) => {
	const {
		username,
		password,
		email,
		dateOfBirth,
		experience,
		category,
	} = req.body;
	const supporter = new Supporter({
		username,
		password,
		email,
		dateOfBirth,
		experience,
		category,
	});

	await supporter.save();
	const token = await supporter.generateToken();

	res
		.status(201)
		.json({ message: 'Supporter registered successfully', supporter, token });
});

router.post(
	'/login',
	validateRequest([
		body('username').exists().withMessage('Username is required'),
		body('password').exists().withMessage('Password is required'),
	]),
	async (req, res) => {
		const { username, password } = req.body;
		const supporter = await Supporter.findOne({
			$or: [{ username: username }, { email: username }],
		});

		if (!supporter)
			return res.status(401).json({
				message: 'Invalid username or password',
				errors: { errors: { login: 'Invalid username or password' } },
			});

		const isMatched = await supporter.checkPassword(password);
		if (!isMatched)
			return res.status(403).json({
				message: 'Invalid username or password',
				errors: { errors: { login: 'Invalid username or password' } },
			});

		const token = await supporter.generateToken();
		res.json({ supporter, token });
	}
);

module.exports = router;
