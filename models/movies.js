const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['Movie'], default: 'Movie' }, // Only allow 'Movie'
    genre: { type: [String], required: true },
    releaseDate: { type: Date, required: true },
    cast: [{ type: String }],
    director: { type: String },
    duration: { type: Number, required: true }, // Duration in minutes
    rating: { type: Number, min: 0, max: 10 },
    description: { type: String, required: true },
    youtubeLink: { type: String, required: true },
    videoPath: { type: String, required: true },
    imagePath: { type: String, required: true },
    subtitlePath: { type: String, required: true },
    views: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
});

// Static method to get trending movies
movieSchema.statics.getTrendingMovies = async function (limit = 10) {
    return this.find().sort({ views: -1 }).limit(limit);
};

module.exports = mongoose.model("Movie", movieSchema);

