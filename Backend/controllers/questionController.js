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

    const question = await Question.create(questionData);

    if (userId) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            solvedQuestions: {
              question: question._id,
              solvedAt: new Date(),
            },
          },
        },
        { new: true }
      );

      if (updatedUser) {
        const streak = calculateStreak(updatedUser.solvedQuestions);
        updatedUser.streak = streak;
        await updatedUser.save();
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

    const user = await User.findById(userId).populate(
      "solvedQuestions.question"
    );
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

exports.getMonthlyProgress = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId).populate("solvedQuestions");
    if (!user) {
      console.warn("User not found in DB");
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 29);
    console.log(
      "Start Date:",
      startDate.toISOString(),
      "Today:",
      today.toISOString()
    );

    const progressMap = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const key = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      progressMap[key] = 0;
    }

    console.log("User solvedQuestions count:", user.solvedQuestions.length);

    user.solvedQuestions.forEach((q) => {
      const solvedDate = new Date(q.solvedAt);
      const key = solvedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

      if (solvedDate >= startDate && solvedDate <= today) {
        if (progressMap[key] !== undefined) {
          progressMap[key]++;
          console.log(`Counted for ${key}: now ${progressMap[key]}`);
        } else {
          console.warn(`Key not in map: ${key}`);
        }
      } else {
        console.log(`Skipped outside range: ${solvedDate.toISOString()}`);
      }
    });

    const progressData = Object.entries(progressMap).map(
      ([day, questions]) => ({ day, questions })
    );

    console.log("Final progressData:", progressData);

    res.status(200).json(progressData);
  } catch (error) {
    console.error("Error fetching progress data:", error);
    res.status(500).json({ message: error.message });
  }
};

function calculateStreak(solvedQuestions) {
  const dates = solvedQuestions
    .map((q) => new Date(q.solvedAt).toDateString())
    .sort((a, b) => new Date(b) - new Date(a));

  const uniqueDates = [...new Set(dates)];
  let streak = 0;
  let currentDate = new Date();

  for (const dateStr of uniqueDates) {
    const date = new Date(dateStr);
    if (date.toDateString() === currentDate.toDateString()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
