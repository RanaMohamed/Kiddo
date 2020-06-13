const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Category name is required"],
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Category description is required"],
  },
  image: {
    type: String,
    required: [true, "Category image is required"],
  },
});

schema.plugin(uniqueValidator, {
  message: "{PATH} is already taken",
});

const Category = mongoose.model("Category", schema);
module.exports = Category;
