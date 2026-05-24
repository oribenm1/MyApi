const Song = require("../models/songModel");
const Review = require("../models/reviewModel");

module.exports = {
    createSong: async (req, res) => {
        try {
            const { firebase_id_ref, name, singer, album, year, genre, imageUrl } = req.body;

            if (!firebase_id_ref || !name || !singer || !imageUrl) {
                return res.status(400).json({
                    message: "firebase_id_ref, name and singer are required"
                });
            }

            const song = new Song({
                firebase_id_ref,
                name,
                singer,
                album,
                year,
                genre,
                imageUrl,
                reviews_id: []   // ✅ FIX: was "reviews"
            });

            await song.save();
            res.status(201).json(song);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    getAllSongs: async (req, res) => {
        try {
            const { genre, singer, sortBy, order } = req.query;

            let filter = {};
            if (genre) filter.genre = genre;
            if (singer) filter.singer = singer;

            let sort = {};
            if (sortBy) {
                sort[sortBy] = order === "desc" ? -1 : 1;
            }

            const songs = await Song.find(filter).sort(sort);
            res.json(songs);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getSongById: async (req, res) => {
        try {
            const song = await Song.findById(req.params.id);

            if (!song) {
                return res.status(404).json({
                    message: "Song not found"
                });
            }

            const reviews = song.reviews_id || [];

            let avg = 0;

            if (reviews.length > 0) {
                const total = reviews.reduce(
                    (sum, r) => sum + r.rating,
                    0
                );

                avg = total / reviews.length;
            }

            res.json({
                ...song.toObject(),
                rating: avg,
                countRating: reviews.length
            });

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    getSongReviews: async (req, res) => {
        try {
            const songId = req.params.id;

            const song = await Song.findById(songId);

            if (!song) {
                return res.status(404).json({ message: "Song not found" });
            }

            const reviewIds = song.reviews_id || [];

            // ❗ FIX: ensure Review is a MODEL (find works only here)
            const reviews = await Review.find({
                _id: { $in: reviewIds }
            }).sort({ createdAt: -1 });

            res.json(reviews);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    addReviewToSong: async (req, res) => {
        try {
            const songId = req.params.id;

            const { userId, userName, rating, comment } = req.body;

            if (!userId || !userName || rating === undefined) {
                return res.status(400).send();
            }

            if (rating < 0 || rating > 5) {
                return res.status(400).send();
            }

            const song = await Song.findById(songId);
            if (!song) {
                return res.status(404).send();
            }

            const review = new Review({
                userId,
                userName,
                rating,
                comment: comment || ""
            });

            await review.save();

            if (!song.reviews_id) song.reviews_id = []; // ❗ FIX

            song.reviews_id.push(review._id);

            const total =
                song.rating * song.countRating + rating;

            song.countRating += 1;
            song.rating = total / song.countRating;

            await song.save();

            return res.sendStatus(201);

        } catch (err) {
            return res.sendStatus(500);
        }
    }
};