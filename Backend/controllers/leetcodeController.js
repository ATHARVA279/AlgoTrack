const LeetCodeQuestion = require("../models/LeetCodeQuestion");
const User = require("../models/User");
const leetcodeService = require("../services/leetcodeService");
const jwt = require("jsonwebtoken");

exports.syncLeetCodeData = async (req, res) => {
  try {
    let { leetcodeUsername } = req.body;
    
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!leetcodeUsername && currentUser.leetcodeUsername) {
      leetcodeUsername = currentUser.leetcodeUsername;
    }

    if (!leetcodeUsername) {
      return res.status(400).json({ message: "LeetCode username is required" });
    }

    const recentSubmissions = await leetcodeService.getUserRecentSubmissions(leetcodeUsername, 100);
    
    const syncedQuestions = [];

    for (const submission of recentSubmissions) {
      try {
        const problemDetails = await leetcodeService.getProblemDetails(submission.titleSlug);
        
        if (!problemDetails) continue;

        let question = await LeetCodeQuestion.findOne({ titleSlug: submission.titleSlug });
        
        if (!question) {
          question = new LeetCodeQuestion({
            questionId: problemDetails.questionId,
            frontendQuestionId: problemDetails.questionFrontendId,
            title: problemDetails.title,
            titleSlug: problemDetails.titleSlug,
            content: problemDetails.content,
            difficulty: problemDetails.difficulty,
            topicTags: problemDetails.topicTags,
            categoryTitle: problemDetails.categoryTitle,
            likes: problemDetails.likes,
            dislikes: problemDetails.dislikes,
            sampleTestCase: problemDetails.sampleTestCase,
            exampleTestcases: problemDetails.exampleTestcases,
            hints: problemDetails.hints,
            userSolutions: []
          });
        }

        let userSolution = question.userSolutions.find(sol => sol.userId.toString() === userId);
        
        if (!userSolution) {
          userSolution = {
            userId: userId,
            isSolved: true,
            submissions: [],
            lastSolvedAt: new Date(submission.timestamp * 1000)
          };
          question.userSolutions.push(userSolution);
        } else {
          userSolution.isSolved = true;
          userSolution.lastSolvedAt = new Date(submission.timestamp * 1000);
        }

        const existingSubmission = userSolution.submissions.find(sub => sub.submissionId === submission.id);
        if (!existingSubmission) {
          userSolution.submissions.push({
            submissionId: submission.id,
            lang: submission.lang,
            timestamp: new Date(submission.timestamp * 1000),
            statusDisplay: submission.statusDisplay
          });
        }

        await question.save();
        syncedQuestions.push(question);

        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error processing submission ${submission.titleSlug}:`, error);
        continue;
      }
    }

    await User.findByIdAndUpdate(userId, { leetcodeUsername });

    res.json({
      success: true,
      message: `Synced ${syncedQuestions.length} questions from LeetCode`,
      syncedCount: syncedQuestions.length
    });

  } catch (error) {
    console.error("Error syncing LeetCode data:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLeetCodeQuestions = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const questions = await LeetCodeQuestion.find({
      "userSolutions.userId": userId
    }).sort({ "userSolutions.lastSolvedAt": -1 });

    const formattedQuestions = questions.map(question => {
      const userSolution = question.userSolutions.find(sol => sol.userId.toString() === userId);
      
      return {
        _id: question._id,
        questionId: question.questionId,
        frontendQuestionId: question.frontendQuestionId,
        title: question.title,
        titleSlug: question.titleSlug,
        difficulty: question.difficulty,
        topicTags: question.topicTags,
        categoryTitle: question.categoryTitle,
        isSolved: userSolution?.isSolved || false,
        lastSolvedAt: userSolution?.lastSolvedAt,
        submissionCount: userSolution?.submissions?.length || 0,
        notes: userSolution?.notes || ""
      };
    });

    res.json(formattedQuestions);

  } catch (error) {
    console.error("Error fetching LeetCode questions:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLeetCodeQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const question = await LeetCodeQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const userSolution = question.userSolutions.find(sol => sol.userId.toString() === userId);

    const response = {
      ...question.toObject(),
      userSolution: userSolution || {
        isSolved: false,
        submissions: [],
        notes: ""
      }
    };

    res.json(response);

  } catch (error) {
    console.error("Error fetching LeetCode question:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, language, notes, isSolved } = req.body;
    
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const question = await LeetCodeQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    let userSolution = question.userSolutions.find(sol => sol.userId.toString() === userId);
    
    if (!userSolution) {
      userSolution = {
        userId: userId,
        isSolved: false,
        submissions: [],
        notes: ""
      };
      question.userSolutions.push(userSolution);
    }

    if (code && language) {
      userSolution.submissions.push({
        lang: language,
        code: code,
        timestamp: new Date(),
        statusDisplay: "Accepted" 
      });
    }

    if (notes !== undefined) userSolution.notes = notes;
    if (isSolved !== undefined) {
      userSolution.isSolved = isSolved;
      if (isSolved) userSolution.lastSolvedAt = new Date();
    }

    await question.save();

    res.json({
      success: true,
      message: "Solution updated successfully"
    });

  } catch (error) {
    console.error("Error updating solution:", error);
    res.status(500).json({ message: error.message });
  }
};