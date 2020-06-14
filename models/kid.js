const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const util = require("util");
const uniqueValidator = require("mongoose-unique-validator");
const _ = require("lodash");

const { saltRounds, jwtSecret } = require("../config/config");
const { emailRegex } = require("../helpers/helper");

const signJWT = util.promisify(jwt.sign);
const verifyJWT = util.promisify(jwt.verify);

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    parentEmail: {
      type: String,
      required: [true, "Parent Email is required"],
      unique: true,
      match: [emailRegex, "Parent Email is invalid"],
    },
    password: {
      type: String,
      minlength: [8, "Password should have a minimum length of 8"],
      required: [true, "Password is required"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of Birth is required"],
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) =>
        _.omit(ret, ["__v", "password", "createdAt", "parentEmail"]),
    },
  }
);

schema.pre("save", async function (next) {
  const kid = this;
  if (!kid.isModified("password")) return next();
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
  message: "{PATH} is already taken",
});

schema.statics.getKidFromToken = async function (token) {
  const Kid = this;
  const { id } = await verifyJWT(token, jwtSecret);
  return Kid.findById(id);
};

schema.index({ username: "text" });

const Kid = mongoose.model("Kid", schema);

module.exports = Kid;
