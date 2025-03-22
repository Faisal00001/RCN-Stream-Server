const express = require("express");
const Wishlist = require("../models/wishlist")

const router = express.Router();

router.post('/add-to-wishlist', async (req, res) => {
    try {
        const { userId, movieId } = req.body;
        if (!userId || !movieId) {
            return res.status(400).json({ message: "User ID and Movie ID are required" });
        }
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            wishlist = new Wishlist({ userId, movies: [{ movieId }] })
        }
        else {
            const movieExists = wishlist.movies.some((item) => item.movieId.toString() === movieId)
            if (movieExists) {
                return res.status(400).json({ message: "Movie already in wishlist" });
            }
            wishlist.movies.push({ movieId });
        }
        await wishlist.save();
        res.status(200).json({ message: "Movie added to wishlist successfully", wishlist });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
})
router.get('/myList', async (req, res) => {
    try {
        const userId = req.query.userId; // Use query params for GET requests

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Find wishlist for the user and populate movie details
        const userWishlist = await Wishlist.findOne({ userId }).populate('movies.movieId');

        if (!userWishlist) {
            return res.status(404).json({ message: "No wishlist found for this user" });
        }

        res.status(200).json(userWishlist.movies);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})
router.delete('/remove/:id', async (req, res) => {
    try {

        const { id } = req.params;
        console.log('IDassdas', id)
        const { userId } = req.query; // Get userId from query params
        console.log(userId)

        if (!id || !userId) {
            return res.status(400).json({ message: "Movie ID and User ID are required" });
        }

        // Find the user's wishlist
        const wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }

        // Filter out the movie from the wishlist
        const updatedMovies = wishlist.movies.filter(movie => movie._id.toString() !== id);

        if (wishlist.movies.length === updatedMovies.length) {
            return res.status(404).json({ message: "Movie not found in wishlist" });
        }

        // Update the wishlist
        wishlist.movies = updatedMovies;
        await wishlist.save();

        res.status(200).json({ message: "Movie removed successfully", wishlist });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
})

module.exports = router