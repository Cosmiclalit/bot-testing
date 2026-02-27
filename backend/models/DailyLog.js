const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  sleep: { type: Number }, // hours
  wakeUpTime: { type: String },
  workHours: { type: Number },
  phoneUsageMinutes: { type: Number },
  notes: { type: String },
});

module.exports = mongoose.model('DailyLog', DailyLogSchema);
