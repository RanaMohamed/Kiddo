const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const validateRequest = require('../middlewares/validateRequest');
const Kid = require('../models/kid');

const { login } = require('../helpers/helper');

router.post('/register', async (req, res) => {
	const { username, password, parentEmail, dateOfBirth } = req.body;
	const kid = new Kid({ username, password, parentEmail, dateOfBirth });

	await kid.save();
	const token = await kid.generateToken();

	res.status(201).json({ message: 'Kid registered successfully', kid, token });
});

router.post(
	'/login',
	validateRequest([
		body('username').exists().withMessage('Username is required'),
		body('password').exists().withMessage('Password is required'),
	]),
	login(Kid)
);

module.exports = router;
