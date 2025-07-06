const History = require('../models/History');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.uploadAndSummarize = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Send file to FastAPI summarization endpoint
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);
    const fastApiRes = await axios.post('http://localhost:8000/summarize', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    const summary = fastApiRes.data.summary;
    await History.create({
      userId: req.user.userId,
      type: 'summary',
      input: req.file.originalname,
      output: summary,
    });
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 