const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');
const uniqueValidator = require('mongoose-unique-validator');
const _ = require('lodash');

const { saltRounds, jwtSecret } = require('../config/config');
const { emailRegex } = require('../helpers/helper');

const signJWT = util.promisify(jwt.sign);
const verifyJWT = util.promisify(jwt.verify);

const schema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, 'Username is required'],
			unique: true,
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			match: [emailRegex, 'Email is invalid'],
		},
		password: {
			type: String,
			minlength: [8, 'Password should have a minimum length of 8'],
			required: [true, 'Password is required'],
		},
		dateOfBirth: {
			type: Date,
			required: [true, 'Date of Birth is required'],
		},
		phone: {
			type: String,
		},
		address: {
			type: String,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (doc, ret) => _.omit(ret, ['__v', 'password', 'createdAt']),
		},
	}
);

schema.pre('save', async function (next) {
	const buyer = this;
	if (!buyer.isModified('password')) return next();
	const currentDocument = this;
	const hashed = await bcrypt.hash(currentDocument.password, saltRounds);
	currentDocument.password = hashed;
});

schema.methods.checkPassword = function (plainPassword) {
	const currentDocument = this;
	return bcrypt.compare(plainPassword, currentDocument.password);
};

schema.methods.generateToken = function () {
	const currentDocument = this;
	return signJWT({ id: currentDocument.id }, jwtSecret);
};

schema.plugin(uniqueValidator, {
	message: '{PATH} is already taken',
});

schema.statics.getBuyerFromToken = async function (token) {
	const Buyer = this;
	const { id } = await verifyJWT(token, jwtSecret);
	return Buyer.findById(id);
};

schema.index({ username: 'text' });

const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', schema);

module.exports = Buyer;
