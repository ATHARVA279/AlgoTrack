const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  language: String,
  code: String,
  explanation: String
});

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic: { type: String, required: true },
  sampleInput: { type: String, required: true },
  sampleOutput: { type: String, required: true },
  solution: solutionSchema
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
