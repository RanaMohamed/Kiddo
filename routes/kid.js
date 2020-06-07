const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const validateRequest = require('../middlewares/validateRequest');
const Kid = require('../models/kid');

router.post('/register', async (req, res) => {
	const { username, password, parentEmail, dateOfBirth } = req.body;
	const kid = new Kid({ username, password, parentEmail, dateOfBirth });

	await kid.save();

	res.status(201).json({ message: 'Kid registered successfully', kid });
});

router.post(
	'/login',
	validateRequest([
		body('username').exists().withMessage('Username is required'),
		body('password').exists().withMessage('Password is required'),
	]),
	async (req, res) => {
		const { username, password } = req.body;
		const kid = await Kid.findOne({ username });

		if (!kid)
			return res.status(401).json({
				message: 'Invalid username or password',
				errors: { errors: { login: 'Invalid username or password' } },
			});

		const isMatched = await kid.checkPassword(password);
		if (!isMatched)
			return res.status(403).json({
				message: 'Invalid username or password',
				errors: { errors: { login: 'Invalid username or password' } },
			});

		const token = await kid.generateToken();
		res.json({ kid, token });
	}
);

module.exports = router;
