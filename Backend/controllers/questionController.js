const Question = require("../models/Question");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.addQuestion = async (req, res) => {
  try {
    const questionData = req.body;
    let userId = null;

    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        console.log("Decoded user ID:", userId);
      } catch (err) {
        console.warn("Invalid or expired token. Proceeding without user.");
      }
    }

    console.log("Incoming cookies:", req.cookies);

    const question = await Question.create(questionData);
    console.log("Question created with ID:", question._id);

    if (userId) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { solvedQuestions: question._id } },
        { new: true }
      );

      if (updatedUser) {
        console.log(
          "Question added to user's solvedQuestions:",
          updatedUser.solvedQuestions
        );
      } else {
        console.warn("User not found or not updated.");
      }
    }

    res.status(201).json(question);
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
