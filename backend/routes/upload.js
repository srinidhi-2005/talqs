const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const auth = require('../middlewares/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/', auth, upload.single('file'), uploadController.uploadAndSummarize);

module.exports = router; 