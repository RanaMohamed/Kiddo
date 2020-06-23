const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary");

const Post = require("../models/post");
const authenticationMiddleware = require("../middlewares/authentication");
const authorize = require("../middlewares/authorize");
const uploadMiddleware = require("../middlewares/upload");
const Like = require("../models/like");
const Product = require("../models/product");
const Kid = require("../models/kid");

//Add Post
router.post(
	"/",
	authenticationMiddleware,
	authorize("Kid"),
	uploadMiddleware.array("attachedFiles", 10),
	async (req, res) => {
		const { title, body, isProduct, price, category } = req.body;
		const post = new Post({
			title,
			body,
			likes: [],
			comments: [],
			isApproved: false,
			category,
		});
		post.authorKid = req.user._id;

		if (isProduct) {
			const product = new Product({ post: post._id, price });
			await product.save();
		}
		await post.save();
		if (req.files) {
			for (const f of req.files) {
				const result = await cloudinary.v2.uploader.upload(f.path);
				post.attachedFiles.push(result.secure_url);
			}
			// req.files.forEach((f) => {
			// 	post.attachedFiles.push(f.path);
			// });
			await post.save();
		}
		res.status(201).json({ post, message: "Post added successfully" });
	}
);

//get latest approved Posts
router.get("/approved", async (req, res) => {
	const filter = { isApproved: true };
	if (req.query.category) {
		filter.category = req.query.category;
	}
	const totalNumOfPosts = await Post.countDocuments(filter);
	const posts = await Post.find(filter)
		.sort({ _id: -1 })
		.skip((parseInt(req.query.pageNum) - 1) * parseInt(req.query.size))
		.limit(parseInt(req.query.size))
		.populate({
			path: "authorKid",
			select: "_id username",
		})
		.populate({
			path: "category",
			select: "_id title",
		})
		.populate("commentsTotal")
		.populate("likes");
	res.send({ posts, totalNumOfPosts });
});

//get latest unApproved Posts
router.get("/unapproved", async (req, res) => {
	const totalNumOfPosts = await Post.countDocuments({ isApproved: false });
	const posts = await Post.find({ isApproved: false })
		.sort({ _id: -1 })
		.skip((parseInt(req.query.pageNum) - 1) * parseInt(req.query.size))
		.limit(parseInt(req.query.size))
		.populate({
			path: "authorKid",
			select: "_id username",
		})
		.populate({
			path: "category",
			select: "_id title",
		});
	res.send({ posts, totalNumOfPosts });
});

//get Post By Id
router.get("/:id", async (req, res) => {
	const post = await Post.findById(req.params.id)
		.populate({
			path: "authorKid",
			select: "_id username",
		})
		.populate({
			path: "category",
		})
		.populate("commentsTotal")
		.populate("likes")
		.populate({
			path: "comments",
			populate: {
				path: "user",
			},
		});
	res.json({ post });
});

//get Posts of specific Kid
router.get("/kid/:kidId", async (req, res) => {
	const totalNumOfPosts = await Post.countDocuments({
		authorKid: req.params.kidId,
		isApproved: true,
	});
	const kidPosts = await Post.find({
		authorKid: req.params.kidId,
		isApproved: true,
	})
		.sort({ updatedAt: -1 })
		.skip((req.query.pageNum - 1) * req.query.size)
		.limit(parseInt(req.query.size))
		.populate({
			path: "authorKid",
			select: "_id username",
		})
		.populate({
			path: "category",
			select: "_id title",
		})
		.populate({
			path: "comments",
			populate: {
				path: "user",
			},
			options: {
				sort: { updatedAt: -1 },
				limit: 2,
			},
		})
		.populate("commentsTotal")
		.populate("likes");
	res.status(200).json({
		kidPosts,
		totalNumOfPosts,
	});
});

//Edit Post
router.patch(
	"/:id",
	authenticationMiddleware,
	uploadMiddleware.array("attachedFiles", 10),
	async (req, res) => {
		const post = await Post.findById(req.params.id);
		Object.keys(req.body).map((key) => (post[key] = req.body[key]));
		if (req.files) {
			post.attachedFiles = [];
			req.files.forEach((f) => {
				post.attachedFiles.push(f.path);
			});
		}

		await post.save();

		res.status(200).json({ message: "Post edited successfully", post });
	}
);

//Delete Post
router.delete("/:id", authenticationMiddleware, async (req, res) => {
	await Post.deleteOne({ _id: req.params.id });
	res.status(200).json({ message: "Post deleted successfully" });
});

router.post("/like/:id", authenticationMiddleware, async (req, res) => {
	const post = await Post.findById(req.params.id).populate({
		path: "likes",
		populate: { path: "user" },
	});

	const isLiked = post.likes.some(
		(like) => like.user._id.toString() === req.user._id.toString()
	);
	if (isLiked) return res.json({ message: "You already like this post" });

	const like = await Like.create({
		post: req.params.id,
		user: req.user._id,
		userModel: req.user.type,
	});

	res.json({ message: "Post Liked Successfully", like });
});

router.post("/unlike/:id", authenticationMiddleware, async (req, res) => {
	const post = await Post.findById(req.params.id).populate({
		path: "likes",
		populate: { path: "user" },
	});

	const like = post.likes.find(
		(like) => like.user._id.toString() === req.user._id.toString()
	);

	if (!like) return res.json({ message: "You didn't like this post" });

	await Like.deleteOne({ _id: like._id });

	res.json({ message: "Post Unliked Successfully", like });
});

//Search
router.post("/search", async (req, res) => {
	try {
		const kids = await Kid.find({
			$text: {
				$search: req.body.query,
			},
		});
		const posts = await Post.find({
			$and: [
				{ category: req.body.category },
				{
					$or: [
						{ $text: { $search: req.body.query } },
						{ authorKid: kids.map((kid) => kid.id) },
					],
				},
			],
		}).populate({
			path: "authorKid",
		});
		if (posts) {
			res.send(posts);
		}
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
