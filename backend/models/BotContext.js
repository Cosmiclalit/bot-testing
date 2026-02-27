const mongoose = require('mongoose');

const BotContextSchema = new mongoose.Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  source: { type: String }, // e.g. "daily_log" or "ocr_image"
  referenceId: { type: mongoose.Schema.Types.ObjectId } // link to original document
});

module.exports = mongoose.model('BotContext', BotContextSchema);
