const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
    category: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['Movie', 'TV Series'], required: true },
    genre: { type: [String], required: true },
    releaseDate: { type: Date, required: true },
    cast: [{ type: String }],
    director: { type: String },
    seasons: { type: Number, required: function () { return this.type === 'TV Series'; } },
    episodes: { type: Number, required: function () { return this.type === 'TV Series'; } },
    duration: { type: Number, required: function () { return this.type === 'Movie'; } }, // Duration in minutes
    rating: { type: Number, min: 0, max: 10 },
    description: { type: String, required: true },
    youtubeLink: { type: String, required: true },
    videoPath: { type: String, required: true },
    imagePath: { type: String, required: true },
    subtitlePath: { type: String, required: true }, // New field for subtitle file
    views: { type: Number, default: 0 }, // New field to track views
    uploadedAt: { type: Date, default: Date.now },
});
// Function to get trending movies (sorted by views or likes)
mediaSchema.statics.getTrendingMovies = async function (limit = 10) {
    return this.find().sort({ views: -1 }).limit(limit); // Sort by views descending
};
module.exports = mongoose.model("Movie", mediaSchema);
