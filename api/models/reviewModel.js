const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },

    userName: {
      type: String,
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },

    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

module.exports = mongoose.model("Review", reviewSchema);