const express = require('express');
const router = express.Router();
const qaController = require('../controllers/qaController');
const auth = require('../middlewares/auth');

router.post('/', auth, qaController.askQuestion);

module.exports = router; 