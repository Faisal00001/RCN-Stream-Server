const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" } // Optional, defaults to "user"

});

module.exports = mongoose.model("User", UserSchema);