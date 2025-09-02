const express = require("express");
const {
  syncLeetCodeData,
  syncAllLeetCodeData,
  getLeetCodeQuestions,
  getLeetCodeQuestionById,
  updateUserSolution,
  populatePopularQuestions,
  getQuestionsCount
} = require("../controllers/leetcodeController");

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  console.log("✅ LeetCode routes are working!");
  res.json({ message: "LeetCode routes are working!" });
});

router.post("/sync", syncLeetCodeData);
router.post("/sync-all", syncAllLeetCodeData);

router.post("/populate", populatePopularQuestions);

router.get("/questions/count", getQuestionsCount);

router.get("/questions", (req, res, next) => {
  console.log("🚀 Route: GET /api/leetcode/questions hit");
  next();
}, getLeetCodeQuestions);

router.get("/questions/:id", getLeetCodeQuestionById);

router.put("/questions/:id/solution", updateUserSolution);

module.exports = router;