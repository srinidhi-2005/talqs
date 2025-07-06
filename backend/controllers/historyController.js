const History = require('../models/History');

exports.getHistory = async (req, res) => {
  try {
    const history = await History.find({ userId: req.user.userId }).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 