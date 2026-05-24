const User = require("../models/userModel");
const Song = require("../models/songModel");

module.exports = {

createUser: async (req, res) => {

    console.log(req.body);

    try {

        const {
            firebase_uid,
            username,
            avatarUrl
        } = req.body;

        // validation
        if (!firebase_uid || !username) {
            return res.status(400).json({
                message: "firebase_uid and username are required"
            });
        }

        const existingUser = await User.findOne({
            firebase_uid
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const user = new User({
            firebase_uid,
            username,
            avatarUrl: avatarUrl || ""
        });

        await user.save();

        res.status(201).json(user);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server error"
        });
    }
},
getUserByUid: async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({ message: "uid param is required" });
        }

        const user = await User.findOne({ firebase_uid: uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
},
getUserPlaylists: async (req, res) => {
    try {
        const user = await User.findOne({ firebase_uid: req.params.uid });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.playlists || []);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
},
createPlaylist: async (req, res) => {
    try {
        const { uid } = req.params;
        const { name,imageUrl } = req.body;

        const user = await User.findOne({ firebase_uid: uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newPlaylist = {
            name,
            imageUrl,
            songs: []
        };

        user.playlists.push(newPlaylist);
        await user.save();

        res.status(201).json({
            message: "Playlist created",
            playlists: user.playlists
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
},
addSongToPlaylist: async (req, res) => {
    try {
        const { uid, playlistId, songId } = req.params;

        const user = await User.findOne({ firebase_uid: uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const playlist = user.playlists.id(playlistId);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        const song = await Song.findById(songId);

        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        const exists = playlist.songs.some(
            (id) => id.toString() === song._id.toString()
        );

        if (!exists) {
            playlist.songs.push(song._id);
            user.markModified("playlists");
        }

        await user.save();

        // 🔥 IMPORTANT: re-fetch with populate AFTER saving
        const updatedUser = await User.findOne({ firebase_uid: uid })
            .populate("playlists.songs");

        const updatedPlaylist = updatedUser.playlists.id(playlistId);

        return res.json({
            message: exists ? "Already exists" : "Song added",
            playlist: updatedPlaylist
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
},

getUserPlaylists: async (req, res) => {
    try {
        const user = await User.findOne({ firebase_uid: req.params.uid })
            .populate("playlists.songs");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json(user.playlists);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
},
likeSong: async (req, res) => {
    try {
        const { uid, songId } = req.params;

        const user = await User.findOne({ firebase_uid: uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // prevent duplicates
        if (!user.likedSongs.includes(songId)) {
            user.likedSongs.push(songId);
            await user.save();
        }

        res.json({ message: "Song liked", likedSongs: user.likedSongs });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
},
unlikeSong: async (req, res) => {
    try {
        const { uid, songId } = req.params;

        const user = await User.findOne({ firebase_uid: uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.likedSongs = user.likedSongs.filter(
            id => id.toString() !== songId
        );

        await user.save();

        res.json({ message: "Song unliked", likedSongs: user.likedSongs });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
},
getUserLikedSongs: async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findOne({ firebase_uid: uid })
            .populate("likedSongs");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.likedSongs || []);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
},
renamePlaylist: async (req, res) => {
    try {
        const { uid, playlistId, name } = req.params;

        if (name === "") {
            return res.status(400).json({ message: name });
        }

        const user = await User.findOne({ firebase_uid: uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const playlist = user.playlists.id(playlistId);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        playlist.name = name.trim();

        await user.save();

        res.status(200).json(playlist);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
},
changePlaylistImage: async (req, res) => {
    try {
        const { uid, playlistId, image } = req.params;

        if (!image || image.trim() === "") {
            return res.status(400).json({ message: "Image URL is required" });
        }

        const user = await User.findOne({ firebase_uid: uid });

        if (!user) {
            console.log("user not found")
            return res.status(404).json({ message: "User not found" });
        }

        const playlist = user.playlists.id(playlistId);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }
        playlist.imageUrl = image.trim();

        await user.save();

        return res.status(200).json(playlist);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
},
deletePlaylist: async (req, res) => {
    try {
        const { uid, playlistId } = req.params;

        const user = await User.findOne({ firebase_uid: uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // find playlist index
        const index = user.playlists.findIndex(
            (p) => p._id.toString() === playlistId
        );

        if (index === -1) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        // remove playlist
        user.playlists.splice(index, 1);

        await user.save();

        return res.json({
            message: "Playlist deleted successfully",
            playlists: user.playlists
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
}
};