const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    youtubeLink: { type: String, required: true },
    videoPath: { type: String, required: true },
    imagePath: { type: String, required: true },
    subtitlePath: { type: String, required: true }, // New field for subtitle file
    views: { type: Number, default: 0 }, // New field to track views
    uploadedAt: { type: Date, default: Date.now },
});

// Function to get trending movies (sorted by views or likes)
movieSchema.statics.getTrendingMovies = async function (limit = 10) {
    return this.find().sort({ views: -1 }).limit(limit); // Sort by views descending
};
module.exports = mongoose.model("Movie", movieSchema);
