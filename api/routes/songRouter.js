const express = require("express");
const router = express.Router();
const {addReviewToSong, getSongReviews, createSong ,getAllSongs ,getSongById} = require("../controllers/songController");

const auth = require("../middleware/auth");

// CRUD + דירוג
// ציבורי
router.get("/", getAllSongs);
router.get("/:id/reviews", getSongReviews);
router.get("/:id", getSongById);
router.post("/:id/review", addReviewToSong);

// מוגן
router.post("/", auth, createSong);

module.exports = router;
