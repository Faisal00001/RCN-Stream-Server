const express = require("express");
const connectDB = require("./db");
const cors = require('cors');
const ipRangeCheck = require("ip-range-check");
const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movieRoutes");
const tvSeriesRoutes = require("./routes/tvSeriesRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
require("dotenv").config();

const app = express();
// 🛡️ Allow only IPs in this CIDR range 
const allowedRanges = ['10.172.1.254', '255.255.255.252', '10.172.1.253'];

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());


// 🌐 🔒 Global IP filter middleware (applies to entire site)
app.use((req, res, next) => {
    // Get the client IP address
    const clientIP = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket?.remoteAddress;

    // console.log("🌐 Incoming request from IP:", clientIP);

    // Allow local IP addresses during development (IPv4 and IPv6)
    if (clientIP === "::1" || clientIP === "127.0.0.1") {
        next(); // Allow local access
    } else if (ipRangeCheck(clientIP, allowedRanges)) {
        next(); // Allow if IP is within allowed range
    } else {
        res.status(403).send("🚫 Access denied: Your IP is not allowed.");
    }
});


// Routes
app.use("/api/auth", authRoutes);
app.use("/uploads/videos", express.static("uploads/videos")); // Serve videos
app.use("/uploads/images", express.static("uploads/images")); // Serve images
app.use("/uploads/subtitles", express.static("uploads/subtitles"));
app.use("/uploads/TvSeriesPosters", express.static("uploads/TvSeriesPosters"));
app.use("/uploads/TvSeriesVideos", express.static("uploads/TvSeriesVideos"));
app.use("/api/movies", movieRoutes);
app.use('/api/tv-series', tvSeriesRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use('/api/category', categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
