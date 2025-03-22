

const mongoose = require("mongoose");

// Define the category schema
const categorySchema = new mongoose.Schema({
    category: { type: String, required: true, unique: true }, // Category name, required
    createdAt: { type: Date, default: Date.now } // Created date, defaults to the current date
});

// Create the Category model based on the schema
const Category = mongoose.model("Category", categorySchema);

// Export the Category model so it can be used in other files
module.exports = Category;
