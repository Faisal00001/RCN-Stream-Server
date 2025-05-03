const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();
require("dotenv").config();
// Register user
// middlewares
const verifyAdmin = require("../middlewares/verifyAdmin");
const verifyToken = require("../middlewares/verifyToken");
router.post("/register", async (req, res) => {
    try {
        const { name, email } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // Create user
        user = new User({ name, email });

        await user.save();



        res.status(201).json({ msg: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
});7
router.post("/jwt", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ msg: "Email is required" });
        }

        const user = await User.findOne({ email }).select("_id"); // Fetch only _id

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, user_id: user._id });
    }
    catch (error) {
        console.error("JWT Error:", error);
        res.status(500).json({ msg: "Server error" });
    }
});
router.get('/users/admin/:email', verifyToken, async (req, res) => {
    const email = req.params.email;

    if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
    }
    const query = { email: email };
    const user = await User.findOne(query);

    console.log(user)
    let admin = false;
    if (user) {
        admin = user?.role === 'admin';
    }
    res.send({ admin });
})


module.exports = router;
