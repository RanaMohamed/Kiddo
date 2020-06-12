const mongoose = require('mongoose');
const _ = require('lodash');

//Product Schema
const schema = new mongoose.Schema(
	{
		price: {
			type: Number,
			required: [true, 'Price is required'],
			index: true,
		},
		buyer: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Buyer',
			},
		],
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post',
			required: [true, 'Product post is required'],
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

schema.virtual('feedbacks', {
	ref: 'Feedback',
	localField: '_id',
	foreignField: 'product',
	justOne: false,
});

schema.virtual('rating').get(function () {
	return (
		this.feedbacks &&
		this.feedbacks.reduce((rate, el) => rate + el.value, 0) /
			this.feedbacks.length
	);
});

const Product = mongoose.model('Product', schema);

module.exports = Product;
