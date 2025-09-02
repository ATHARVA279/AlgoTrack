const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  leetcodeUsername: { type: String },
  solvedQuestions: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      solvedAt: { type: Date, default: Date.now },
    },
  ],
  // LeetCode specific tracking
  leetcodeProfile: {
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    lastSyncAt: { type: Date },
    ranking: { type: Number },
  },
  leetcodeSolvedQuestions: [
    {
      leetcodeQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: "LeetCodeQuestion" },
      titleSlug: { type: String, required: true },
      title: { type: String, required: true },
      difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
      solvedAt: { type: Date },
      submissions: [{
        submissionId: String,
        lang: String,
        timestamp: Date,
        statusDisplay: String,
        code: String, // Store user's solution code
      }],
      notes: { type: String, default: "" },
      isFavorite: { type: Boolean, default: false },
    }
  ],
  streak: { type: Number, default: 0 },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", UserSchema);
