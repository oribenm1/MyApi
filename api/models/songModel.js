const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
    firebase_id_ref: {
        type:String , 
        required:true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    singer: {
        type: String,
        required: true,
        trim: true
    },
    album: {
        type: String,
        trim: true
    },
    year: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear()
    },
    countRating: {
        type:Number
    },
    genre: {
        type: String,
        enum: [
            "Pop",
            "Rock",
            "Hip Hop",
            "Rap",
            "Electronic",
            "Jazz",
            "Classical",
            "Other"
        ],
        default: "Other"
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    }
}, { timestamps: true });

module.exports = mongoose.model("Song", songSchema);
