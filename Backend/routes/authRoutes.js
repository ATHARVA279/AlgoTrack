const express = require('express');
const router = express.Router();
const { signupUser, loginUser } = require('../controllers/authController');

router.post('/signup', signupUser);   // ✅ New Signup Route
router.post('/login', loginUser);

module.exports = router;
