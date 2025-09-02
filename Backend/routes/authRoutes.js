const express = require("express");
const router = express.Router();

const {
  signupUser,
  loginUser,
  getMe,
  updateLeetCodeUsername,
  logoutUser,
} = require("../controllers/authController");

router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/me", getMe);
router.put("/update-leetcode", updateLeetCodeUsername);
router.post("/logout", logoutUser);

module.exports = router;
