const express = require("express");
const router = express.Router();
const {
  signupUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../controllers/authController");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/me", getMe);
router.post("/logout", logoutUser);

module.exports = router;
