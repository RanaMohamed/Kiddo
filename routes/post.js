const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authenticationMiddleware = require("../middlewares/authentication");
const asyncRouterWrapper = require("../middlewares/asyncRouterWrapper");
const uploadMiddleware = require("../middlewares/upload");

//Add Post
router.post(
  "/",
  //authenticationMiddleware,
  uploadMiddleware.array("uploadedFiles", 10),
  asyncRouterWrapper(async (req, res, next) => {
    const { title, body } = req.body;
    const post = new Post({ title, body, likes: [], comments: [] });
    // post.autherKid = req.kid._id;

    //for testing
    //post.autherKid = "5ede83ab8a74fa441461bb56";
    if (req.files) {
      req.files.forEach(f => {
        post.attachedFiles.push(f.path);
      });
    }
    await post.save();
    res.status(201).json({ post, message: "Post added successfully" });
  })
);

//get latest Posts
router.get(
  "/",
  asyncRouterWrapper(async (req, res, next) => {
    const totalNumOfPosts = await Post.countDocuments();
    const Posts = await Post.find({})
      .sort({ _id: -1 })
      .skip((parseInt(req.query.pageNum) - 1) * parseInt(req.query.size))
      .limit(parseInt(req.query.size))
      .populate({
        path: "autherKid",
        select: "_id username"
      });
    res.send({ Posts, totalNumOfPosts });
  })
);

//get Post By Id
router.get(
  "/:id",
  asyncRouterWrapper(async (req, res) => {
    const post = await Post.findById(req.params.id).populate({
      path: "autherKid",
      select: "_id username"
    });
    res.json({ post });
  })
);

//get Posts of specific Kid
router.get(
  "/kid/:kidId",
  //authenticationMiddleware,
  asyncRouterWrapper(async (req, res) => {
    const totalNumOfPosts = await Post.countDocuments({
      autherKid: req.params.kidId
    });
    const kidPosts = await Post.find({
      autherKid: req.params.kidId
    })
      .sort({ updatedAt: -1 })
      .skip((req.query.pageNum - 1) * req.query.size)
      .limit(parseInt(req.query.size))
      .populate({
        path: "autherKid",
        select: "_id username"
      });
    res.status(200).json({
      kidPosts,
      totalNumOfPosts
    });
  })
);

//Edit Post
router.patch(
  "/:id",
  // authenticationMiddleware,
  uploadMiddleware.array("uploadedFiles", 10),
  asyncRouterWrapper(async (req, res) => {
    const post = await Post.findById(req.params.id);
    Object.keys(req.body).map(key => (post[key] = req.body[key]));
    if (req.files) {
      post.attachedFiles = [];
      req.files.forEach(f => {
        post.attachedFiles.push(f.path);
      });
    }

    await post.save();

    res.status(200).json({ message: "Post edited successfully", post });
  })
);

//Delete Post
router.delete(
  "/:id",
  // authenticationMiddleware,
  asyncRouterWrapper(async (req, res) => {
    await Post.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Post deleted successfully" });
  })
);

module.exports = router;
