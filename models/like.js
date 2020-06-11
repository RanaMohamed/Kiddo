const mongoose = require('mongoose');
const _ = require('lodash');

//LIKE Schema
const likeSchema = new mongoose.Schema(
	{
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post',
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			refPath: 'userModel',
		},
		userModel: {
			type: String,
			enum: ['Kid', 'Buyer', 'Supporter'],
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (doc, ret) => _.omit(ret, ['__v', 'createdAt', 'userModel']),
		},
	}
);

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
