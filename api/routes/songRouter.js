const express = require("express");
const router = express.Router();
const {createUser,getUserByUid,createSong ,getAllSongs ,getSongById ,getSongsByUser,deleteSong ,updateRating,updateSong} = require("../controllers/songController");

router.post("/users", createUser);
router.get("/user/:uid", getUserByUid);
router.post("/", createSong);
router.get("/", getAllSongs);
router.get("/:id", getSongById);
router.get("/user/:firebase_id_ref", getSongsByUser);
router.patch("/:id", updateSong);
router.patch("/:id/rating", updateRating);
router.delete("/:id", deleteSong);

module.exports = router;
