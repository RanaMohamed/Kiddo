const express = require('express');
const router = express.Router();

// const { body } = require("express-validator");
const authenticationMiddleware = require('../middlewares/authentication');

const Comment = require('../models/comment');
const Post = require('../models/post');

//Add Comment
router.post('/:id', authenticationMiddleware, async (req, res) => {
	const { text } = req.body;

	const comment = await Comment.create({
		post: req.params.id,
		text,
		user: req.user._id,
		userModel: req.user.type,
	});

	res.status(201).json({ comment, message: 'Comment added successfully' });
});

// EDIT COMMENT
router.patch('/:id/:postId', async (req, res) => {
	const post = await Post.findById({ _id: req.params.postId });

	const comment = post.comments.find((comment) => comment == req.params.id);

	if (!comment) return res.send('not found');
	Object.keys(req.body).forEach((key) => {
		comment[key] = req.body[key];
	});
	res.status(200).json({ comment, message: 'Comment edited successfully' });
});

//DELETE COMMENT
router.delete('/:id/:postId', async (req, res) => {
	const post = await Post.findById({ _id: req.params.postId });

	const deleted = post.comments.filter(
		(commentId) => commentId != req.params.id
	);

	if (!deleted) return res.send('no comments found');
	post.comments = deleted;
	await post.save();
	res.status(200).json({ message: 'Comment deleted successfully' });
});

//get post comments
router.get('/:id', async (req, res) => {
	const postComments = await Post.findById({ _id: req.params.id }).populate({
		path: 'comments',
		populate: {
			path: 'user',
		},
	});
	res.status(200).send(postComments);
});

//get first 2 comments
router.get('/:id/2', async (req, res) => {
	const postComments = await Post.findById({ _id: req.params.id }).populate({
		path: 'comments',
		options: {
			limit: 2,
			sort: { updatedAt: 1 },
			select: 'text',
		},
		populate: {
			path: 'user',
		},
	});

	res.status(200).send(postComments.comments);
});
module.exports = router;
