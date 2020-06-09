const express = require("express");
const router = express.Router();

// const { body } = require("express-validator");
const authenticationMiddleware = require("../middlewares/authentication");
const asyncRouterWrapper = require("../middlewares/asyncRouterWrapper");
const Comment = require("../models/comment");
const Post = require("../models/Post");

//Add Comment
router.post(
  "/:id",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res) => {
    const post = await Post.findById({ _id: req.params.id });

    const text = req.body;
    const comment = new Comment({ text });

    post.comments.push(comment);
    await post.save();
    res.status(201).json({ comment, message: "Comment added successfully" });
  })
);

// EDIT COMMENT
router.patch(
  "/:id",
  asyncRouterWrapper(async (req, res) => {
    const comment = await Comment.findById({ _id: req.params.id });
    // comment.text = req.body;
    console.log(comment);
    // await comment.save();
    // res.status(200).json({ comment, message: "Comment edited successfully" });
  })
);

//get post comments
router.get(
  "/:id",
  asyncRouterWrapper(async (req, res) => {
    const postComments = await Post.findById({ _id: req.params.id })
      .select("comments")
      .populate({
        path: "Comment",
        select: "text",
      });

    res.status(200).send(postComments);
  })
);
module.exports = router;
