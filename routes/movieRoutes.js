const express = require("express");
const multer = require("multer");
const path = require("path");
const Movie = require("../models/movies");

const router = express.Router();




// Allowed file extensions
const allowedImageExtensions = [".png", ".jpg", ".jpeg", ".gif"];
const allowedVideoExtensions = [".mp4", ".mkv", ".mov"];
const allowedSubtitleExtensions = [".srt", ".vtt"];

// File filter function
const fileFilter = (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    console.log("Uploaded file:", file.originalname, "MIME type:", file.mimetype, "Extension:", fileExt);

    if (allowedImageExtensions.includes(fileExt)) {
        cb(null, true);
    } else if (allowedVideoExtensions.includes(fileExt)) {
        cb(null, true);
    } else if (allowedSubtitleExtensions.includes(fileExt)) {
        cb(null, true);
    } else {
        console.error("❌ Unsupported file type:", file.mimetype, "Extension:", fileExt);
        cb(new Error("Invalid file type"), false);
    }
};

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fileExt = path.extname(file.originalname).toLowerCase();

        if (allowedImageExtensions.includes(fileExt)) {
            cb(null, "uploads/images");
        } else if (allowedVideoExtensions.includes(fileExt)) {
            cb(null, "uploads/videos");
        } else if (allowedSubtitleExtensions.includes(fileExt)) {
            cb(null, "uploads/subtitles");
        } else {
            cb(new Error("Invalid file type"), null);
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Final multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;


// POST route to upload movie with image
router.post("/upload-movie", upload.fields([{ name: "video" }, { name: "image" }, { name: "subtitle" }]), async (req, res) => {
    try {
        console.log("Uploaded files:", req.files); // Debugging line

        const { category, title, description, youtubeLink } = req.body;

        // Ensure videoPath is assigned only if the file exists
        const videoPath = req.files["video"] ? req.files["video"][0].path : null;
        const imagePath = req.files["image"] ? req.files["image"][0].path : null;
        const subtitlePath = req.files["subtitle"] ? req.files["subtitle"][0].path : null;

        if (!videoPath) {
            return res.status(400).json({ message: "Video file is required." });
        }

        const newMovie = new Movie({ category, title, description, youtubeLink, videoPath, imagePath, subtitlePath });
        await newMovie.save();

        res.status(201).json({ message: "Movie uploaded successfully", movie: newMovie });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET all movies
router.get("/all-movies", async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
// Get movies category

// POST route to add a new category


// GET movies by category
router.get("/movies/:category", async (req, res) => {
    try {
        const category = req.params.category;
        const movies = await Movie.find({ category });
        console.log(movies);
        if (movies.length === 0) {
            return res.status(404).json({ message: "No movies found for this category" });
        }

        res.json(movies);
    } catch (err) {
        console.error("Error fetching movies by category:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// GET movie by ID
router.get("/movie/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.json(movie);
    } catch (err) {
        console.error("Error fetching movie by ID:", err);
        res.status(500).json({ message: "Server error" });
    }
});
const getTrendingMovies = async (req, res) => {
    try {
        const trendingMovies = await Movie.getTrendingMovies();
        res.json(trendingMovies);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trending movies" });
    }
};
router.get("/trending", getTrendingMovies);

router.patch('/update-views/:id', async (req, res) => {
    try {
        const { id } = req.params
        await Movie.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
        res.status(200).json({ message: "View count updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update view count", error });
    }
})

// module.exports = { getTrendingMovies };

module.exports = router;
