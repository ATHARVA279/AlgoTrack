const express = require("express");
const {
  syncLeetCodeData,
  getLeetCodeQuestions,
  getLeetCodeQuestionById,
  updateUserSolution
} = require("../controllers/leetcodeController");

const router = express.Router();

router.post("/sync", syncLeetCodeData);

router.get("/questions", (req, res, next) => {
  console.log("🚀 Route: GET /api/leetcode/questions hit");
  next();
}, getLeetCodeQuestions);

router.get("/questions/:id", getLeetCodeQuestionById);

router.put("/questions/:id/solution", updateUserSolution);

module.exports = router;