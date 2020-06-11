const mongoose = require("mongoose");
const _ = require("lodash");

//Feedback Schema
const feedbackSchema = new mongoose.Schema(
  {
    text: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Feedback user is required"],
      ref: "Buyer"
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => _.omit(ret, ["__v", "createdAt"])
    }
  }
);

//Product Schema
const schema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: [true, "price is required"],
      index: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer"
    },
    rating: {
      type: Number
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Product post is required"]
    },
    feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: "feedbackSchema" }]
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => _.omit(ret, ["__v", "createdAt"]),
      virtuals: true
    }
  }
);
mongoose.model("feedbackSchema", feedbackSchema);
const Product = mongoose.model("Product", schema);

module.exports = Product;
