const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config()
const path = require('path');



const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// import routes
const logsRoute = require('./routes/logs');
const imagesRoute = require('./routes/images');
const botRoute = require('./routes/bot');

app.use('/api/logs', logsRoute);
app.use('/api/images', imagesRoute);
app.use('/api/bot', botRoute);

// cron jobs for reminders
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// simple daily email reminder at 8am
cron.schedule('0 8 * * *', () => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Daily Productivity Reminder',
    text: 'Don\'t forget to log your activities for today!'
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error('Reminder email error', err);
    else console.log('Reminder email sent', info.response);
  });
});

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
