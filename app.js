require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "*/*" }));

// 🔥 Firebase Admin
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf-8")
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// MongoDB
const uri = process.env.MONGO_STR;

async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}

connectDB();

// static files
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use("/songs", require('./api/routes/songRouter'));
app.use("/users", require('./api/routes/userRouter'));

module.exports = app;