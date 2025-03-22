const express = require("express");
const Category = require('../models/category');
const router = express.Router();

// POST request to add a new category
router.post("/add-category", async (req, res) => {
    try {
        const { category } = req.body; // Get category name from request body

        // Validate category
        if (!category) {
            return res.status(400).json({ message: "Category name is required." });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ category });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists." });
        }

        // Create a new category document
        const newCategory = new Category({ category });

        // Save the new category to the database
        await newCategory.save();

        // Send success response
        res.status(201).json({ message: "Category added successfully!", category: newCategory });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: "Error adding category", error: error.message });
    }
});
// GET request to fetch all categories
router.get("/get-categories", async (req, res) => {
    try {
        // Fetch all categories from the database
        const categories = await Category.find();

        // Check if no categories are found
        if (categories.length === 0) {
            return res.status(404).json({ message: "No categories found." });
        }

        // Send success response with categories
        res.status(200).json({ categories });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
});


module.exports = router;
