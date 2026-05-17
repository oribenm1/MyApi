const express = require("express");
const router = express.Router();
const { createUser, getUserByUid } = require("../controllers/userController");

router.post("/", createUser);
router.get("/:uid", getUserByUid);

module.exports = router;