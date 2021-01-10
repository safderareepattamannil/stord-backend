const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
    name: String,
    dateUploaded: { type: Date, default: Date.now() },
    dateTaken: Date,
    location: [Number],
    fileSize: Number,
    delete: { marked: Boolean, expiryDate: Date },
    tags: [String],
});

module.exports = mongoose.model('Media', mediaSchema);