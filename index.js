const express = require("express");
const connectDB = require("./db");
const cors = require('cors');
const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movieRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/uploads/videos", express.static("uploads/videos")); // Serve videos
app.use("/uploads/images", express.static("uploads/images")); // Serve images
app.use("/uploads/subtitles", express.static("uploads/subtitles"));
app.use("/api/movies", movieRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use('/api/category', categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
