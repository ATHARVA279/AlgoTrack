const mongoose = require("mongoose");

const leetCodeQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true },
    frontendQuestionId: { type: String, required: true },
    title: { type: String, required: true },
    titleSlug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    difficulty: { 
      type: String, 
      enum: ["Easy", "Medium", "Hard"], 
      required: true 
    },
    topicTags: [{ 
      name: String, 
      slug: String 
    }],
    categoryTitle: { type: String },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    sampleTestCase: { type: String },
    exampleTestcases: { type: String },
    hints: [String],
    userSolutions: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isSolved: { type: Boolean, default: false },
      submissions: [{
        submissionId: String,
        lang: String,
        code: String,
        runtime: String,
        memory: String,
        timestamp: Date,
        statusDisplay: String
      }],
      notes: String,
      lastSolvedAt: Date
    }]
  },
  { timestamps: true }
);

leetCodeQuestionSchema.index({ titleSlug: 1 });
leetCodeQuestionSchema.index({ "userSolutions.userId": 1 });

module.exports = mongoose.model("LeetCodeQuestion", leetCodeQuestionSchema);