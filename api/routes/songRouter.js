const express = require("express");
const router = express.Router();
const {createSong ,getAllSongs ,getSongById ,getSongsByUser,deleteSong ,updateRating,updateSong} = require("../controllers/songController");

// CRUD + דירוג
router.post("/", createSong);
router.get("/", getAllSongs);
router.get("/:id", getSongById);
router.get("/user/:firebase_id_ref", getSongsByUser);
router.patch("/:id", updateSong);
router.patch("/:id/rating", updateRating);
router.delete("/:id", deleteSong);

module.exports = router;
