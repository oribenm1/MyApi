const User = require("../models/userModel");

module.exports = {

createUser: async (req, res) => {
    try {
        const existingUser = await User.findOne({ username: req.body.username });

        if (existingUser) {
            return res.status(409).json({
                code: "USERNAME_EXISTS",
                message: "Username already exists"
            });
        }

        // ✅ create user
        const user = await User.create(req.body);

        return res.status(201).json(user);

    } catch (err) {
        console.error("Error in createUser:", err);
        if (err.code === 11000) {
            return res.status(409).json({
                code: "USERNAME_EXISTS",
                message: "Username already exists"
            });
        }

        return res.status(500).json({
            code: "SERVER_ERROR",
            message: err.message
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

        const song = await Song.findOne(songId)
        if (!playlist.songs.includes(song)) {
            playlist.songs.push(song);
        }

        await user.save();

        res.json({
            message: "Song added to playlist",
            playlist
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
},

getUserPlaylists: async (req, res) => {
    try {
        const user = await User.findOne({ firebase_uid: req.params.uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.playlists || []);

    } catch (err) {
        res.status(500).json({ error: err.message });
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
getSongsByIds: async (req, res) => {
    try {
        const { ids } = req.body;

        const songs = await Song.find({
            _id: { $in: ids }
        });

        res.status(200).json(songs);

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
}
};