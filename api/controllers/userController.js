const User = require("../models/userModel");

module.exports = {

    createUser: async (req, res) => {
    try {
        // ✅ support both raw object OR wrapped object
        const body = req.body.user ? req.body.user : req.body;

        const firebase_uid = body.firebase_uid || body.firebaseUid;
        const username = body.username;
        const avatarUrl = body.avatarUrl || "";

        if (!firebase_uid || !username) {
            return res.status(400).json({
                message: "firebase_uid and username are required",
                received: body
            });
        }

        let user = await User.findOne({ firebase_uid });

        if (user) {
            return res.status(200).json(user);
        }

        user = new User({
            firebase_uid,
            username,
            avatarUrl
        });

        await user.save();

        return res.status(201).json(user);

    } catch (err) {
        return res.status(500).json({
            message: "Server error",
            error: err.message
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

        // avoid duplicates
        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
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

getUserLikedSongs: async (req, res) => {
    try {
        const user = await User.findOne({ firebase_uid: req.params.uid })
            .populate("likedSongs");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.likedSongs || []);
    } catch (err) {
        res.status(400).json({ error: err.message });
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
renamePlaylist: async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { name } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Name cannot be empty" });
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { name: name.trim() },
            { new: true }
        );

        if (!updatedPlaylist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        res.status(200).json(updatedPlaylist);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}
};