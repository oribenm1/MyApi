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
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);