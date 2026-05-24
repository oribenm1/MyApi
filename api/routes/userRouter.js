const express = require("express");
const router = express.Router();
const {deletePlaylist, changePlaylistImage, renamePlaylist, createUser, getUserByUid, getUserLikedSongs,getUserPlaylists,unlikeSong,createPlaylist,addSongToPlaylist,likeSong } = require("../controllers/userController");

router.post("/", createUser);
router.get("/get/:uid", getUserByUid);
router.get("/:uid/liked", getUserLikedSongs);
router.get("/:uid/playlists", getUserPlaylists);
router.post("/:uid/liked/:songId", likeSong);
router.delete("/:uid/liked/:songId", unlikeSong);
router.post("/:uid/playlists", createPlaylist);
router.post("/:uid/playlists/:playlistId/songs/:songId", addSongToPlaylist);
router.put("/:uid/playlists/:playlistId/:name", renamePlaylist);
router.put("/:uid/playlists/:playlistId/image/:image", changePlaylistImage);
router.delete("/deletePlaylist/:uid/:playlistId", deletePlaylist);

module.exports = router;