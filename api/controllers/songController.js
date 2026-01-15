const Song = require("../models/songModel");

module.exports = {

    // 1️⃣ הוספת שיר חדש (שייך למשתמש לפי firebase_id_ref)
    createSong: async (req, res) => {
        try {
            const { firebase_id_ref, name, singer, album, year, genre, rating } = req.body;

            if (!firebase_id_ref || !name || !singer) {
                return res.status(400).json({ message: "firebase_id_ref, name and singer are required" });
            }

            const song = new Song({
                firebase_id_ref,
                name,
                singer,
                album,
                year,
                genre,
                rating: rating || 0,
                countRating: rating ? 1 : 0
            });

            await song.save();
            res.status(201).json(song);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // 2️⃣ דירוג שיר (מעדכן ממוצע ומספר דירוגים)
    updateRating: async (req, res) => {
        try {
            const { rating } = req.body;

            if (rating < 0 || rating > 5) {
                return res.status(400).json({ message: "Rating must be between 0 and 5" });
            }

            const song = await Song.findById(req.params.id);
            if (!song) return res.status(404).json({ message: "Song not found" });

            song.rating = ((song.rating * song.countRating) + rating) / (song.countRating + 1);
            song.countRating += 1;

            await song.save();
            res.json(song);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // 3️⃣ שליפת כל השירים עם מיון וסינון
    getAllSongs: async (req, res) => {
        try {
            const { genre, singer, minRating, maxRating, sortBy, order } = req.query;

            let filter = {};
            if (genre) filter.genre = genre;
            if (singer) filter.singer = singer;
            if (minRating) filter.rating = { ...filter.rating, $gte: parseFloat(minRating) };
            if (maxRating) filter.rating = { ...filter.rating, $lte: parseFloat(maxRating) };

            let sort = {};
            if (sortBy) {
                sort[sortBy] = order === "desc" ? -1 : 1; // 1 = ascending, -1 = descending
            }

            const songs = await Song.find(filter).sort(sort);
            res.json(songs);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 4️⃣ שליפת שיר לפי ID
    getSongById: async (req, res) => {
        try {
            const song = await Song.findById(req.params.id);
            if (!song) return res.status(404).json({ message: "Song not found" });

            res.json(song);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // 5️⃣ שליפת שירים של משתמש לפי firebase_id_ref
    getSongsByUser: async (req, res) => {
        try {
            const { firebase_id_ref } = req.params;
            const songs = await Song.find({ firebase_id_ref });
            res.json(songs);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // 6️⃣ עדכון פרטי שיר
    updateSong: async (req, res) => {
        try {
            const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!song) return res.status(404).json({ message: "Song not found" });
            res.json(song);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // 7️⃣ מחיקת שיר
    deleteSong: async (req, res) => {
        try {
            await Song.findByIdAndDelete(req.params.id);
            res.json({ message: "Song deleted" });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
};
