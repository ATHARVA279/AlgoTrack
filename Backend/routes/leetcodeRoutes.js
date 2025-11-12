const express = require("express");
const {
  syncLeetCodeData,
  syncAllLeetCodeData,
  getLeetCodeQuestions,
  getLeetCodeQuestionById,
  updateUserSolution,
  addManualQuestion,
  getQuestionsCount
} = require("../controllers/leetcodeController");

const router = express.Router();

// Sync routes
router.post("/sync", syncLeetCodeData);
router.post("/sync-all", syncAllLeetCodeData);

// Question routes
router.get("/questions/count", getQuestionsCount);
router.get("/questions", getLeetCodeQuestions);
router.get("/questions/:id", getLeetCodeQuestionById);

// Solution and manual question routes
router.put("/questions/:id/solution", updateUserSolution);
router.post("/questions/add-manual", addManualQuestion);

module.exports = router;