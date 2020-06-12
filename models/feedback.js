const mongoose = require('mongoose');
const _ = require('lodash');

const schema = new mongoose.Schema(
	{
		value: Number,
		text: String,
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'Feedback user is required'],
			ref: 'Buyer',
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'Product is required'],
			ref: 'Product',
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (doc, ret) => _.omit(ret, ['__v', 'createdAt']),
		},
	}
);

const Feedback = mongoose.model('Feedback', schema);

module.exports = Feedback;
