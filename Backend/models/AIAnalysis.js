const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },

  lineByLineExplanation: [{
    lineNumber: Number,
    code: String,
    explanation: String
  }],
  bigOComplexity: {
    time: String,
    space: String,
    explanation: String
  },
  codeAnalysis: {
    approach: String,
    strengths: [String],
    improvements: [String],
    alternativeApproaches: [String]
  },
smartSuggestions: [
  {
    type: { type: String, required: true },
    description: { type: String, default: "" },
    relatedTopics: [{ type: String }]
  }
],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

aiAnalysisSchema.index({ questionId: 1, userId: 1, code: 1 });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);