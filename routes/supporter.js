const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const validateRequest = require("../middlewares/validateRequest");
const authenticate = require("../middlewares/authentication");
const Supporter = require("../models/Supporter");
const Post = require("../models/post");

const { login } = require("../helpers/helper");

router.post("/register", async (req, res) => {
  const {
    username,
    password,
    email,
    dateOfBirth,
    experience,
    categories,
  } = req.body;

  const supporter = new Supporter({
    username,
    password,
    email,
    dateOfBirth,
    experience,
    categories,
  });
  // supporter.categories = "5ee61856095c2b48d8bd8ef4";

  await supporter.save();
  const token = await supporter.generateToken();

  res.status(201).json({
    message: "Supporter registered successfully",
    supporter,
    token,
    type: "Supporter",
  });
});

router.post(
  "/login",
  validateRequest([
    body("username").exists().withMessage("Username is required"),
    body("password").exists().withMessage("Password is required"),
  ]),
  login(Supporter)
);

// Approve Post
router.post("/approvePost/:postId", authenticate, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (post.isApproved === true)
    return res.json({ message: "Post already approved" });

  post.isApproved = true;
  await post.save();
  res.json({ message: "Post approved Successfully", post });
});

//get Supporters
router.get("/", authenticate, async (req, res) => {
  const supporters = await Supporter.find({});
  res.send(supporters);
});

//get Supporters by Category
router.get("/supportersCategory", async (req, res) => {
  const supporters = await Supporter.find({ categories: req.query.category });

  if (!supporters)
    return res.status(400).json({ message: "No Supporter for this category" });

  res.status(200).json({ supporters });
});

//get Supporter by id
router.get("/:id", async (req, res) => {
  const supporter = await Supporter.findById(req.params.id).populate(
    "categories"
  );

  if (!supporter)
    return res.status(400).json({ message: "Supporter doesn't exist" });

  res.json({ user: supporter });
});

module.exports = router;
