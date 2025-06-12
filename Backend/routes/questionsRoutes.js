const express = require("express");
const {
  addQuestion,
  getQuestions,
  getQuestionById,
} = require("../controllers/questionController");
const router = express.Router();

router.post("/", addQuestion);
router.get("/", getQuestions);
router.get("/:id", getQuestionById);

module.exports = router;
