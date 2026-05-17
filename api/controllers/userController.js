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
}
};