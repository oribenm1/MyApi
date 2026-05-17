const User = require("../models/userModel");

module.exports = {

    createUser: async (req, res) => {
        try {
            const { id, username, avatarUrl } = req.body;

            let user = await User.findOne({ firebase_uid: id });

            if (user) {
                return res.json(user); // כבר קיים
            }

            user = new User({
                firebase_uid: id,
                username,
                avatarUrl
            });

            await user.save();
            res.status(201).json(user);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    getUserByUid: async (req, res) => {
        try {
            const user = await User.findOne({ firebase_uid: req.params.uid });

            if (!user) return res.status(404).json({ message: "User not found" });

            res.json(user);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
};