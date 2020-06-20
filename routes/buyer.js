const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const validateRequest = require('../middlewares/validateRequest');
const authenticate = require('../middlewares/authentication');
const authorize = require('../middlewares/authorize');
const Buyer = require('../models/Buyer');
const Product = require('../models/product');

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
		.json({
			message: 'Buyer registered successfully',
			buyer,
			token,
			type: 'Buyer',
		});
});

router.post(
	'/login',
	validateRequest([
		body('username').exists().withMessage('Username is required'),
		body('password').exists().withMessage('Password is required'),
	]),
	login(Buyer)
);

//get latest Buyer’s bought products
router.get('/products', authenticate, authorize('Buyer'), async (req, res) => {
	const totalNumOfProducts = await Product.countDocuments({
		buyer: req.user._id,
	});
	if (totalNumOfProducts === 0)
		return res.status(400).json({ message: "You didn't buy any product" });

	const Products = await Product.find({ buyer: req.user._id })
		.sort({ _id: -1 })
		.skip((parseInt(req.query.pageNum) - 1) * parseInt(req.query.size))
		.limit(parseInt(req.query.size))
		.populate({
			path: 'post',
			select: '_id title body authorKid attachedFiles',
		});
	res.send({ Products, totalNumOfProducts });
});

module.exports = router;
