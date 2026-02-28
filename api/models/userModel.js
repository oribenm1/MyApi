const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: {
    type: String, // firebase uid
    required: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  avatarUrl: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);