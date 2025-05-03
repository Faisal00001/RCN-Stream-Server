// models/TVSeries.js
const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    duration: Number, // in minutes
    videoFile: { type: String, required: true },
    subtitleFile: String,
    releaseDate: Date,
});

const seasonSchema = new mongoose.Schema({
    seasonNumber: { type: Number, required: true },
    episodes: [episodeSchema], // Nested array of episodes
});

const tvSeriesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['TvSeries'], default: 'TvSeries' }, // Only allow 'Movie'
    genre: [String], // e.g., ['Action', 'Mystery']
    releaseDate: Date,
    cast: [String],
    director: String,
    rating: Number,
    description: String,
    posterUrl: String, // image
    youtubeLink: String,
    seasons: [seasonSchema], // Array of seasons with nested episodes
    views: { type: Number, default: 0 },
}, {
    timestamps: true,
});
// Static method to get trending tv-series
tvSeriesSchema.statics.getTrendingTvSeries = async function (limit = 10) {
    return this.find().sort({ views: -1 }).limit(limit);
};

module.exports = mongoose.model("TVSeries", tvSeriesSchema);
