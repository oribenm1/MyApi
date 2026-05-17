const Song = require("../models/songModel");
const Review = require("../models/reviewModel");
module.exports = {

    // 1️⃣ Create Song
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
                reviews: []
            });

            await song.save();
            res.status(201).json(song);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },


    // 2️⃣ ADD REVIEW + CALCULATE AVERAGE
    updateRating: async (req, res) => {
        try {

            const { rating, comment, userId, userName } = req.body;

            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    message: "Rating must be between 1 and 5"
                });
            }

            const song = await Song.findById(req.params.id);

            if (!song) {
                return res.status(404).json({
                    message: "Song not found"
                });
            }

            // 🔥 push new review
            song.reviews.push({
                userId,
                userName,
                rating,
                comment
            });

            await song.save();

            // 🔥 calculate average
            const total = song.reviews.reduce(
                (sum, r) => sum + r.rating,
                0
            );

            const avg = total / song.reviews.length;

            res.json({
                ...song.toObject(),
                rating: avg,
                countRating: song.reviews.length
            });

        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    },


    // 3️⃣ Get All Songs
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


    // 4️⃣ Get Song By ID
    getSongById: async (req, res) => {
        try {
            const song = await Song.findById(req.params.id);

            if (!song) {
                return res.status(404).json({
                    message: "Song not found"
                });
            }

            // compute average on response
            let avg = 0;

            if (song.reviews.length > 0) {
                const total = song.reviews.reduce(
                    (sum, r) => sum + r.rating,
                    0
                );

                avg = total / song.reviews.length;
            }

            res.json({
                ...song.toObject(),
                rating: avg,
                countRating: song.reviews.length
            });

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },


    // 5️⃣ Get Songs by User
    getSongsByUser: async (req, res) => {
        try {
            const { firebase_id_ref } = req.params;

            const songs = await Song.find({ firebase_id_ref });
            res.json(songs);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },


    // 6️⃣ Update Song
    updateSong: async (req, res) => {
        try {
            const song = await Song.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            if (!song) {
                return res.status(404).json({
                    message: "Song not found"
                });
            }

            res.json(song);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },


    // 7️⃣ Delete Song
    deleteSong: async (req, res) => {
        try {
            await Song.findByIdAndDelete(req.params.id);

            res.json({
                message: "Song deleted"
            });

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    // 💬 Get all reviews for a song by songId
    getSongReviews: async (req, res) => {
    try {
        const songId = req.params.id;

        // 1. Find song
        const song = await Song.findById(songId);

        if (!song) {
        return res.status(404).json({ message: "Song not found" });
        }

        // 2. Get review IDs
        const reviewIds = song.reviews_id || [];

        // 3. Fetch reviews from Review collection
        const reviews = await Review.find({
        _id: { $in: reviewIds }
        }).sort({ createdAt: -1 });

        // 4. Return reviews
        res.json(reviews);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    },
        // 💬 Add review to song (no response body, only status)
    addReviewToSong: async (req, res) => {
    try {
        const songId = req.params.id;

        const { userId, userName, rating, comment } = req.body;

        // 1. Validate
        if (!userId || !userName || rating === undefined) {
        return res.status(400).send();
        }

        if (rating < 0 || rating > 5) {
        return res.status(400).send();
        }

        // 2. Find song
        const song = await Song.findById(songId);
        if (!song) {
        return res.status(404).send();
        }

        // 3. Create review
        const review = new Review({
        userId,
        userName,
        rating,
        comment: comment || ""
        });

        await review.save();

        // 4. Attach review ID
        song.reviews_id.push(review._id);

        // 5. Update rating average
        const total =
        song.rating * song.countRating + rating;

        song.countRating += 1;
        song.rating = total / song.countRating;

        // 6. Save song
        await song.save();

        // 7. SUCCESS ONLY (no JSON body)
        return res.sendStatus(201);

    } catch (err) {
        return res.sendStatus(500);
    }
    }
};