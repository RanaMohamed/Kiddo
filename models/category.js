const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Category description is required"],
  },
});

const Category = mongoose.model("Category", schema);
module.exports = Category;
