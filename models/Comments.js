const mongoose = require("mongoose");

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
const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
