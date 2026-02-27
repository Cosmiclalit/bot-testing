const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Tesseract = require('tesseract.js');
const ImageModel = require('../models/Image');
const BotContext = require('../models/BotContext');
const { getEmbedding } = require('../utils/gemini');

// setup storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { filename, path: filePath } = req.file;

    const fs = require('fs');
    const fileSize = fs.statSync(filePath).size;
   

    // Read the file as buffer (WINDOWS FIX)
    const buffer = fs.readFileSync(filePath);

    // OCR using buffer instead of file path
    const result = await Tesseract.recognize(buffer, 'eng');
    console.log(result.data.text)
    

    const text = result.data.text || '';
    

    // Save image + text
    const img = new ImageModel({ filename, path: filePath, ocrText: text });
    await img.save();

    // Get proper embedding (extract values)
    const embeddingResponse = await getEmbedding(text);
    const embedding = embeddingResponse // <--- FIX
    

    // Save in BotContext
    await BotContext.create({
      text,
      embedding,
      source: 'ocr_image',
      referenceId: img._id
    });

    res.json(img);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

 
router.get('/', async (req, res) => {
  try {
    const imgs = await ImageModel.find({}).sort({ uploadedAt: -1 });
    res.json(imgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ImageModel.findByIdAndDelete(req.params.id);
    await BotContext.deleteMany({ referenceId: req.params.id, source: 'ocr_image' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
