const User = require("../models/userModel");

module.exports = {

    createUser: async (req, res) => {
    try {
        const { firebase_uid, username, avatarUrl } = req.body;

        // ✅ Validate required fields
        if (!firebase_uid || !username) {
            return res.status(400).json({
                message: "firebase_uid and username are required"
            });
        }

        // ✅ Check if user already exists
        let user = await User.findOne({ firebase_uid });

        // If exists → return existing user
        if (user) {
            return res.status(200).json(user);
        }

        // ✅ Create new user
        user = new User({
            firebase_uid,
            username,
            avatarUrl: avatarUrl || ""
        });

        await user.save();

        return res.status(201).json(user);

    } catch (err) {
        return res.status(500).json({
            message: "Server error while creating user",
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
}
};