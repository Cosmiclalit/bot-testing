const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  ocrText: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', ImageSchema);
