const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firebase_uid: {
        type: String,
        required: true,
        unique: true
    },

    username: {
        type: String,
        required: true,
        minlength: 3
    },

    avatarUrl: {
        type: String,
        default: ""
    },
    likedSongs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song"
        }
    ],
    playlists: [
        {
            imageUrl: {
                type: String,
                default: ""
            },
            name: {
                type: String,
                default: "My Playlist"
            },
            songs: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Song"
                }
            ],
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);