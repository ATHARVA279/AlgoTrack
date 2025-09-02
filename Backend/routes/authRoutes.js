const express = require("express");
const router = express.Router();
const {
  signupUser,
  loginUser,
  getMe,
  updateLeetCodeUsername,
  logoutUser,
} = require("../controllers/authController");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/me", getMe);
router.put("/leetcode-username", updateLeetCodeUsername);
router.post("/logout", logoutUser);

module.exports = router;
