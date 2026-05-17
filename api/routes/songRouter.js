const express = require("express");
const router = express.Router();
const {addReviewToSong, getSongReviews, createSong ,getAllSongs ,getSongById ,getSongsByUser,deleteSong ,updateRating,updateSong} = require("../controllers/songController");

const auth = require("../middleware/auth");

// CRUD + דירוג
// ציבורי
router.get("/", getAllSongs);
router.get("/user/:firebase_id_ref", getSongsByUser);
router.get("/:id/reviews", getSongReviews);
router.get("/:id", getSongById);

// מוגן
router.post("/", auth, createSong);
router.post("/:id/reviews", auth, addReviewToSong);
router.patch("/:id", auth, updateSong);
router.patch("/:id/rating", auth, updateRating);
router.delete("/:id", auth, deleteSong);

module.exports = router;
