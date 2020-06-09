const mongoose = require("mongoose");
//COMMENT Schema
const commentSchema = new mongoose.Schema({
  text: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  onModel: {
    type: String,
    enum: ["Kid", "Buyer", "Supporter"],
  },
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
