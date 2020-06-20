const mongoose = require('mongoose');
const _ = require('lodash');

//COMMENT Schema
const commentSchema = new mongoose.Schema(
	{
		text: { type: String, required: [true, 'Comment body is required'] },
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

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
