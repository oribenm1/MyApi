const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    firebase_id_ref: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    singer: {
      type: String,
      required: true,
      trim: true
    },

    album: {
      type: String,
      trim: true
    },

    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear()
    },

    genre: {
      type: String,
      enum: [
        "Pop",
        "Rock",
        "Hip Hop",
        "Rap",
        "Electronic",
        "Jazz",
        "Classical",
        "Other"
      ],
      default: "Other"
    },

    imageUrl: {
      type: String,
      required: true
    },

    // ⭐ average rating (fast display)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    countRating: {
      type: Number,
      default: 0
    },

    // 💬 ONLY REVIEW IDS (strings)
    reviews_id: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);