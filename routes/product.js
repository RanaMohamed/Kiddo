const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const Product = require("../models/product");
const Feedback = require("../models/feedback");
const Post = require("../models/post");
const validateRequest = require("../middlewares/validateRequest");
const authenticate = require("../middlewares/authentication");
const authorize = require("../middlewares/authorize");

const transport = require("../helpers/mail");

//Buy product
router.post("/buy/:id", authenticate, authorize("Buyer"), async (req, res) => {
	// Todo: Check Payment Info
	const { payment } = req.body;
	if (!payment) {
		return res.status(402).json({ message: "Failed to buy product" });
	}
	const product = await Product.findById(req.params.id);
	if (!product) return res.status(400).json({ message: "Product not found" });

	const index = product.buyer.indexOf(req.user._id);
	if (index !== -1)
		return res.status(400).json({ message: "You already bought this product" });

	product.buyer.push(req.user._id);
	await product.save();

	await transport.sendMail({
		from: process.env.USER,
		to: req.user.email,
		subject: "Purchase",
		text: "You Bought this product",
	});

	res.status(201).json({ product, message: "Product bought successfully" });
});

router.post(
	"/rate/:id",
	validateRequest([body("value").exists().withMessage("Value is required")]),
	authenticate,
	authorize("Buyer"),
	async (req, res) => {
		const { value, text } = req.body;

		const product = await Product.findById(req.params.id).populate("feedbacks");

		if (!product) return res.status(400).json({ message: "Product not found" });
		// console.log(product);
		const index = product.buyer.indexOf(req.user._id);

		if (index === -1)
			return res.status(400).json({ message: "You didn't buy this product" });

		const isRated = product.feedbacks.some(
			(feedback) => feedback.user.toString() === req.user._id.toString()
		);
		if (isRated)
			return res
				.status(400)
				.json({ message: "You already rated this product" });

		const feedback = new Feedback({
			product: product._id,
			user: req.user._id,
			value: value,
			text: text,
		});
		await feedback.save();
		// const productPopulated = await Product.findById(req.params.id).populate(
		//   "feedbacks"
		// );

		res.status(201).json({ message: "Product rated successfully", feedback });
	}
);

//Get Product by Id
router.get("/:id", async (req, res) => {
	const product = await Product.findById(req.params.id).populate("feedbacks");
	res.status(201).json({ product, message: "Product retrevied successfully" });
});

//Get latest Products or By search using (product name - and category)
router.get("/", async (req, res) => {
	const searchText = req.query.searchText;
	const categoriesArray = req.query.categoriesArray;
	if (searchText && !categoriesArray) {
		let posts = await Post.find({ $text: { $search: searchText } });
		posts = posts.map((p) => p._id);
		if (posts.length === 0)
			return res.json({
				message: "No Products with such name",
				products: [],
				totalNumOfProducts: 0,
			});
		const totalNumOfProducts = await Product.countDocuments({ post: posts });
		const products = await Product.find({ post: posts }).populate({
			path: "post",
			select: "_id title body authorKid attachedFiles category",
		});
		res.send({ products, totalNumOfProducts });
	} else if (categoriesArray && !searchText) {
		let posts = await Post.find({
			category: categoriesArray,
		});
		posts = posts.map((p) => p._id);
		if (posts.length === 0)
			return res.json({
				message: "No Products within such category/categories",
				products: [],
				totalNumOfProducts: 0,
			});
		const totalNumOfProducts = await Product.countDocuments({ post: posts });
		const products = await Product.find({ post: posts }).populate({
			path: "post",
			select: "_id title body authorKid attachedFiles category",
		});
		res.send({ products, totalNumOfProducts });
	} else if (categoriesArray && searchText) {
		let posts = await Post.find({
			$and: [
				{ $text: { $search: searchText } },
				{
					category: categoriesArray,
				},
			],
		});
		posts = posts.map((p) => p._id);
		if (posts.length === 0)
			return res.json({
				message: "No Products with such name or category",
				products: [],
				totalNumOfProducts: 0,
			});
		const totalNumOfProducts = await Product.countDocuments({ post: posts });
		const products = await Product.find({ post: posts }).populate({
			path: "post",
			select: "_id title body authorKid attachedFiles category",
		});
		res.send({ products, totalNumOfProducts });
	} else {
		const totalNumOfProducts = await Product.countDocuments();
		const products = await Product.find({})
			.sort({ _id: -1 })
			.skip((parseInt(req.query.pageNum) - 1) * parseInt(req.query.size))
			.limit(parseInt(req.query.size))
			.populate({
				path: "post",
				select: "_id title body authorKid attachedFiles",
				populate: "authorKid likes commentsTotal",
			})
			.populate("feedbacks");
		res.send({ products, totalNumOfProducts });
	}
});

module.exports = router;
