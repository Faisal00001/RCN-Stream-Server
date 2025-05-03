const express = require('express');
const router = express.Router();
const multer = require('multer');
const TVSeries = require("../models/TVSeries");
const path = require('path');
const fs = require('fs');
const MAX_SEASONS = 10;
const MAX_EPISODES = 20;

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Multer disk storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = 'uploads/others';

        if (file.fieldname === 'tv-series-poster') {
            dest = 'uploads/TvSeriesPosters';
        } else if (file.fieldname.includes('videoFile')) {
            dest = 'uploads/TvSeriesVideos';
        } else if (file.fieldname.includes('subtitleFile')) {
            dest = 'uploads/TVSeriesSubtitles';
        }

        ensureDirectoryExists(dest);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname.replace(/\[|\]/g, '_') + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

const uploadFields = [
    { name: 'tv-series-poster', maxCount: 1 },
    // { name: 'cast[]' },
    // { name: 'genre[]' },
];

// Dynamic episode video and subtitle fields (support many files)
const dynamicEpisodeFields = [];

for (let s = 0; s < MAX_SEASONS; s++) {
    for (let e = 0; e < MAX_EPISODES; e++) {
        dynamicEpisodeFields.push({ name: `seasons[${s}][episodes][${e}][videoFile]`, maxCount: 1 });
        dynamicEpisodeFields.push({ name: `seasons[${s}][episodes][${e}][subtitleFile]`, maxCount: 1 });
    }
}

// Merge all fields
const allFields = [...uploadFields, ...dynamicEpisodeFields];

// Upload route
router.post('/upload-tv-series', upload.fields(allFields), async (req, res) => {
    try {
        const body = req.body;
        const files = req.files;
        // Convert body values
        const title = body.title;
        const director = body.director;
        const rating = parseFloat(body.rating) || 0;
        const youtubeLink = body.youtubeLink;
        const releaseDate = body.releaseDate ? new Date(body.releaseDate) : null;
        const description = body.description;
        const genres = Array.isArray(body.genre) ? body.genre : [body.genre];
        const cast = Array.isArray(body.cast) ? body.cast : [body.cast];
        const posterFile = files["tv-series-poster"]?.[0] || null;
        const posterPath = posterFile?.path || null;
        const posterFilename = posterFile?.originalname || null;
        const seasons = [];

        for (let s = 0; s < MAX_SEASONS; s++) {
            const episodes = [];

            for (let e = 0; e < MAX_EPISODES; e++) {
                const videoFile = files[`seasons[${s}][episodes][${e}][videoFile]`]?.[0];
                const subtitleFile = files[`seasons[${s}][episodes][${e}][subtitleFile]`]?.[0];

                // Only push episode if video or subtitle exists
                if (videoFile || subtitleFile) {
                    episodes.push({
                        title: body.seasons[s]?.episodes[e]?.title || `Episode ${e + 1}`,
                        description: body.seasons[s]?.episodes[e]?.description || '',
                        duration: body.seasons[s]?.episodes[e]?.duration || '',
                        releaseDate: body.seasons[s]?.episodes[e]?.releaseDate || '',
                        videoFile: videoFile?.path || null,
                        subtitleFile: subtitleFile?.path || null,
                        videoFilename: videoFile?.originalname || null,
                        subtitleFilename: subtitleFile?.originalname || null,
                    });
                }
            }

            if (episodes.length > 0) {
                seasons.push({ seasonNumber: s + 1, episodes });
            }
        }


        const newSeries = new TVSeries({
            title,
            description,
            genre: genres,
            cast,
            type: 'TvSeries',
            director,
            rating,
            releaseDate,
            youtubeLink,
            posterUrl: posterPath,
            seasons
        });

        await newSeries.save();


        res.status(200).json({
            message: 'TV Series uploaded successfully',
            data: {
                title,
                description,
                genres,
                cast,
                posterPath,
                posterFilename,
                seasons
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading TV Series', error });
    }
});
// Get TV Series by ID
router.get('/tv-series-details/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tvSeries = await TVSeries.findById(id);

        if (!tvSeries) {
            return res.status(404).json({ message: 'TV Series not found' });
        }

        res.status(200).json(tvSeries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve TV Series', error });
    }
});
// Get latest tv series
router.get("/latest-tv-series", async (req, res) => {
    try {
        const latestTvSeries = await TVSeries.find({ type: "TvSeries" })
            .sort({ releaseDate: -1 }) // Sort by releaseDate descending
            .limit(10); // Return the 10 latest tv series (optional)

        res.json(latestTvSeries);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
// all tv series
// Route: GET /all-tvseries

router.get("/all-tvseries", async (req, res) => {
    try {
        const tvSeries = await TVSeries.find({ type: "TvSeries" }).sort({ releasedDate: -1 }); // Optional: sort by latest
        res.status(200).json(tvSeries);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
const getTrendingTvSeries = async (req, res) => {
    try {
        const trendingTvShows = await TVSeries.getTrendingTvSeries();
        res.json(trendingTvShows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trending tv shows" });
    }
};
router.get("/trending", getTrendingTvSeries);

module.exports = router;
