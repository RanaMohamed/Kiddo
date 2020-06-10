const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const Categories = await Category.find({}).sort({ _id: -1 });
  res.status(200).send(Categories);
});

router.get("/:id", async (req, res) => {
  const Category = await Category.findById({ _id: req.params.id });
  res.status(200).send(Category);
});

module.exports = router;
