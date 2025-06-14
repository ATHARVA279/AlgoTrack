const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate("solvedQuestions.question");

    if (!user) return res.status(404).json({ message: "User not found" });

    const topicCount = {};
    user.solvedQuestions.forEach(({ question }) => {
      const topic = question.topic || "Misc";
      topicCount[topic] = (topicCount[topic] || 0) + 1;
    });

    const profileData = {
      name: user.username,
      email: user.email,
      joinedDate: user._id.getTimestamp(),
      streak: user.streak,
      totalSolved: user.solvedQuestions.length,
      practiceTime: Math.round(user.solvedQuestions.length * 0.5), // Assuming 30 mins/question
      topicsCompleted: topicCount,
    };

    res.status(200).json(profileData);
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).json({ message: err.message });
  }
};
