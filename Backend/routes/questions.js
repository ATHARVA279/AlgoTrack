console.log("✅ questions.js router loaded"); // Top of file

import express from 'express';
import Question from '../models/Question';

const router = express.Router();

router.post('/', async (req, res) => {
  const { title, description, difficulty, topic, sampleInput, sampleOutput, solution } = req.body;

  try {
    const question = new Question({
      title,
      description,
      difficulty,
      topic,
      sampleInput,
      sampleOutput,
      solution,
      createdAt: new Date(),
      updatedAt: new Date(),
      solvedAt: new Date(),
      user: req.user._id
    });

    await question.save();

    return res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const questions = await Question.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findOne({ _id: req.params.id, user: req.user._id });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    return res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error('Error fetching question:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  const { title, description, difficulty, topic, sampleInput, sampleOutput, solution } = req.body;

  try {
    const question = await Question.findOne({ _id: req.params.id, user: req.user._id });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question.title = title;
    question.description = description;
    question.difficulty = difficulty;
    question.topic = topic;
    question.sampleInput = sampleInput;
    question.sampleOutput = sampleOutput;
    question.solution = solution;
    question.updatedAt = new Date();

    await question.save();

    return res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error('Error updating question:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    return res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;