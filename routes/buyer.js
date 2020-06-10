const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const validateRequest = require('../middlewares/validateRequest');
const Buyer = require('../models/Buyer');

const { login } = require('../helpers/helper');

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
	login(Buyer)
);

module.exports = router;
