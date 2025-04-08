const express = require('express');
const router = express.Router();
const { addQuestion } = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addQuestion);

module.exports = router;
