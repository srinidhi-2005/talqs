const axios = require('axios');

exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'No question provided' });
    }
    // Send question to FastAPI QA endpoint
    const fastApiRes = await axios.post('http://localhost:8000/qa', { question });
    const answer = fastApiRes.data.answer;
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 