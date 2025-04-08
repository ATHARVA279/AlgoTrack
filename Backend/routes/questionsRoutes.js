const express = require('express');
const { addQuestion, getQuestions } = require('../controllers/questionController');
const router = express.Router();

router.post('/', addQuestion);
router.get('/', getQuestions);

module.exports = router;
