const mongoose = require("mongoose");
const _ = require("lodash");

//COMMENT Schema
const commentSchema = new mongoose.Schema({
  text: String,
  refOn: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "onModel",
  },
  onModel: {
    type: String,
    enum: ["Kid", "Buyer", "Supporter"],
  },
});

//LIKE Schema
const likeSchema = new mongoose.Schema({
  refOn: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "onModel",
  },
  onModel: {
    type: String,
    enum: ["Kid", "Buyer", "Supporter"],
  },
});

//POST Schema
const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      index: true,
    },
    body: {
      type: String,
      required: [true, "Post body is required"],
    },
    attachedFiles: {
      type: [String],
    },
    autherKid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kid",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "likeSchema" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "commentSchema" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => _.omit(ret, ["__v", "createdAt"]),
    },
  }
);
const Comment = mongoose.model("Comment", commentSchema);
const Likes = mongoose.model("Like", likeSchema);
const Post = mongoose.model("Post", schema);
module.exports = Comment;
module.exports = Likes;
module.exports = Post;
