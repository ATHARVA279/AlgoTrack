const Question = require('../models/Question');

exports.addQuestion = async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res.status(201).json({ message: 'Question added successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
