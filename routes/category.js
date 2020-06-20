const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/upload");
const Category = require("../models/category");

router.get("/", async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json({ categories });
});

router.post("/", uploadMiddleware.single("image"), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : "";
  const category = new Category({
    title,
    description,
    image,
  });
  await category.save();
  res.status(201).json({ category, message: "category added successfully" });
});

router.get("/:id", async (req, res) => {
  const Category = await Category.findById({ _id: req.params.id });
  res.status(200).send(Category);
});

module.exports = router;
