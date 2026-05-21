const express = require("express");
const router = express.Router();
const {renamePlaylist, getSongsByIds,createUser, getUserByUid,getUserLikedSongs,getUserPlaylists,unlikeSong,createPlaylist,addSongToPlaylist,likeSong } = require("../controllers/userController");

router.post("/", createUser);
router.get("/get/:uid", getUserByUid);
router.get("/:uid/liked", getUserLikedSongs);
router.get("/:uid/playlists", getUserPlaylists);
router.post("/:uid/liked/:songId", likeSong);
router.delete("/:uid/liked/:songId", unlikeSong);
router.post("/:uid/playlists", createPlaylist);
router.post("/:uid/playlists/:playlistId/songs/:songId", addSongToPlaylist);
router.post("/songs/byIds", getSongsByIds);
router.put("/playlist/:name",renamePlaylist );

module.exports = router;