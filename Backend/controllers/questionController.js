const Question = require("../models/Question");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.addQuestion = async (req, res) => {
  try {
    const questionData = req.body;
    let userId = null;

    const token = req.cookies?.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;

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
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId).populate("solvedQuestions");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.solvedQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ message: error.message });
  }
};
