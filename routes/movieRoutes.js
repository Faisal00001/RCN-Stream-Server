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

        const { type, title, genre, releaseDate, cast, director, duration, rating, description, youtubeLink } = req.body;

        // Ensure videoPath is assigned only if the file exists
        const videoPath = req.files["video"] ? req.files["video"][0].path : null;
        const imagePath = req.files["image"] ? req.files["image"][0].path : null;
        const subtitlePath = req.files["subtitle"] ? req.files["subtitle"][0].path : null;

        if (!videoPath) {
            return res.status(400).json({ message: "Video file is required." });
        }

        const newMovie = new Movie({ type, title, genre, releaseDate, cast, director, duration, rating, description, youtubeLink, videoPath, imagePath, subtitlePath });
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

        const movies = await Movie.find({ type: "Movie" });
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
// GET all Tv Series
router.get("/all-tvShows", async (req, res) => {
    try {
        const tvShows = await Movie.find({ type: "TV Series" });
        res.json(tvShows)
    } catch (err) {
        res.status(500).json({ message: "Server error" })
    }
})
// Get latest movies
router.get("/latest-movies", async (req, res) => {
    try {
        const latestMovies = await Movie.find({ type: "Movie" })
            .sort({ releaseDate: -1 }) // Sort by releaseDate descending
            .limit(10); // Return the 10 latest movies (optional)

        res.json(latestMovies);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
// Route to get the details of a series episode based on ID, season, and episode
router.get("/tvShows/:id/episodes", async (req, res) => {

    const { id } = req.params;
    const { season, episode } = req.query; // Get season and episode from query string

    try {
        const movie = await Movie.findById(id);

        if (!movie || movie.type !== 'TV Series') {
            return res.status(404).json({ message: "Movie not found or not a TV series" });
        }

        // Validate season and episode parameters
        if (season > movie.seasons || episode > movie.episodes) {
            return res.status(400).json({ message: "Invalid season or episode number" });
        }

        // Here, assuming each episode has a similar videoPath, subtitlePath, etc. for now.
        const episodeData = {
            title: `${movie.title} - Season ${season} Episode ${episode}`,
            videoPath: movie.videoPath, // You can store episode-specific paths in your database if needed
            subtitlePath: movie.subtitlePath,
            imagePath: movie.imagePath,
            description: movie.description,
        };

        // Return episode details
        return res.json(episodeData);
    } catch (error) {
        console.error("Error fetching episode:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// total seasons and episodes of tv series
router.get('/tvShows/:id/metadata', async (req, res) => {
    try {
        const tvShow = await Movie.findById(req.params.id);

        if (!tvShow || tvShow.type !== 'TV Series') {
            return res.status(404).json({ message: 'TV Show not found or not a TV Series' });
        }

        res.json({
            title: tvShow.title,
            totalSeasons: tvShow.seasons,
            totalEpisodes: tvShow.episodes
        });
    } catch (error) {
        console.error("Error fetching metadata:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get movies category

// POST route to add a new category


// GET media by category
router.get("/movies/:category", async (req, res) => {
    try {
        const category = req.params.category;
        const movies = await Movie.find({ category });

        if (movies.length === 0) {
            return res.status(404).json({ message: "No movies found for this category" });
        }

        res.json(movies);
    } catch (err) {
        console.error("Error fetching movies by category:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// GET media by type
router.get("/media/:type", async (req, res) => {
    try {
        const type = req.params.type;
        const media = await Movie.find({ type });
        if (media.length === 0) {
            return res.status(404).json({ message: "No media found for this type" });
        }
        res.json(media)
    }
    catch (err) {
        console.error('Error fetching movies by type', err);
        res.status(500).json({ message: "Server error" });
    }
})
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
