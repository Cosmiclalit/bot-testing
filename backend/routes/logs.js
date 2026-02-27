const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const BotContext = require('../models/BotContext');
const { getEmbedding } = require('../utils/gemini');

// create or update a log
router.post('/', async (req, res) => {
  try {
    const { date, sleep, wakeUpTime, workHours, phoneUsageMinutes, notes } = req.body;
    let log = await DailyLog.findOneAndUpdate(
      { date: new Date(date) },
      { sleep, wakeUpTime, workHours, phoneUsageMinutes, notes },
      { upsert: true, new: true }
    );

    // generate embedding and store context
    const text = `Date: ${date}, sleep: ${sleep}, wakeUpTime: ${wakeUpTime}, workHours: ${workHours}, phoneUsage: ${phoneUsageMinutes}, notes: ${notes}`;
    const embedding = await getEmbedding(text);
    await BotContext.findOneAndUpdate(
      { referenceId: log._id, source: 'daily_log' },
      { text, embedding, source: 'daily_log', referenceId: log._id },
      { upsert: true }
    );

    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// get all logs
router.get('/', async (req, res) => {
  try {
    const logs = await DailyLog.find({}).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete a log
router.delete('/:id', async (req, res) => {
  try {
    await DailyLog.findByIdAndDelete(req.params.id);
    await BotContext.deleteMany({ referenceId: req.params.id, source: 'daily_log' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
