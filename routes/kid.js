const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const validateRequest = require('../middlewares/validateRequest');
const authenticate = require('../middlewares/authentication');
const Kid = require('../models/kid');
const transport = require('../helpers/mail');

const { login } = require('../helpers/helper');

router.post('/register', async (req, res) => {
	const { username, password, parentEmail, dateOfBirth } = req.body;
	const kid = new Kid({ username, password, parentEmail, dateOfBirth });

	await kid.save();
	if (kid) {
		transport.sendMail(
			{
				from: process.env.user,
				to: parentEmail,
				subject: 'Registration',
				text:
					"Your Kid is registered in our website 'Kiddo', if u want you can checkout their profile.",
			},
			(err, info) => {
				if (err) {
					console.log(err.stack);
				} else {
					console.log(info);
				}
			}
		);
	}
	const token = await kid.generateToken();

	res.status(201).json({
		message: 'Kid registered successfully',
		kid,
		token,
		type: 'Kid',
	});
});

router.post(
	'/login',
	validateRequest([
		body('username').exists().withMessage('Username is required'),
		body('password').exists().withMessage('Password is required'),
	]),
	login(Kid)
);

router.post('/followCategory/:categoryId', authenticate, async (req, res) => {
	const kid = await Kid.findById(req.user._id);
	if (kid.categories.indexOf(req.params.categoryId) !== -1)
		return res.json({ message: 'Category already followed' });

	kid.categories.push(req.params.categoryId);
	await kid.save();
	res.json({ message: 'Category Followed Successfully' });
});

router.post('/unfollowCategory/:categoryId', authenticate, async (req, res) => {
	const kid = await Kid.findById(req.user._id);
	if (kid.categories.indexOf(req.params.categoryId) === -1)
		return res.json({ message: 'You are not following this category' });

	kid.categories.pull(req.params.categoryId);
	await kid.save();
	res.json({ message: 'Category Unfollowed Successfully' });
});

router.get('/:id', async (req, res) => {
	const kid = await Kid.findById(req.params.id).populate('categories');

	if (!kid) return res.status(400).json({ message: "User Doesn't Exist" });

	res.json({ user: kid });
});

module.exports = router;
