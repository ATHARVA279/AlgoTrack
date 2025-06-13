const express = require("express");
const {
  addQuestion,
  getQuestions,
  getQuestionById,
  getMonthlyProgress
} = require("../controllers/questionController");
const router = express.Router();

router.post("/", addQuestion);
router.get("/", getQuestions);
router.get("/monthly-progress", getMonthlyProgress); 
router.get("/:id", getQuestionById);

module.exports = router;
