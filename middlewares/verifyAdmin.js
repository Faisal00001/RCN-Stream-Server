const User = require("../models/user");

const verifyAdmin = async (req, res, next) => {
    try {
        const email = req.decoded?.email; // Ensure email exists
        if (!email) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findOne({ email });

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden access" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = verifyAdmin;
