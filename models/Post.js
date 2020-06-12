const mongoose = require('mongoose');
const _ = require('lodash');

//POST Schema
const schema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Post title is required'],
			index: true,
		},
		body: {
			type: String,
			required: [true, 'Post body is required'],
		},
		attachedFiles: {
			type: [String],
		},
		autherKid: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Kid',
			required: true,
		},
		comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
		isApproved: {
			type: Boolean,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (doc, ret) => _.omit(ret, ['__v', 'createdAt']),
			virtuals: true,
		},
	}
);

schema.virtual('likes', {
	ref: 'Like',
	localField: '_id',
	foreignField: 'post',
	justOne: false,
});

const Post = mongoose.model('Post', schema);

module.exports = Post;
