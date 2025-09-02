const LeetCodeQuestion = require("../models/LeetCodeQuestion");
const User = require("../models/User");
const leetcodeService = require("../services/leetcodeService");
const jwt = require("jsonwebtoken");

exports.syncLeetCodeData = async (req, res) => {
  try {
    console.log("🔄 Backend: Starting LeetCode sync...");
    let { leetcodeUsername } = req.body;

    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      console.log("❌ Backend: No token provided for sync");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log("👤 Backend: Syncing for user ID:", userId);

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

    console.log("🔗 Backend: LeetCode username:", leetcodeUsername);

    // Reduce the number of submissions to sync to prevent timeout
    const recentSubmissions = await leetcodeService.getUserRecentSubmissions(
      leetcodeUsername,
      20
    );
    console.log("📊 Backend: Found submissions:", recentSubmissions.length);

    if (recentSubmissions.length === 0) {
      return res.status(400).json({
        message:
          "No recent submissions found. Please check your LeetCode username or make sure you have solved some problems recently.",
      });
    }

    const syncedQuestions = [];
    let processedCount = 0;

    for (const submission of recentSubmissions) {
      try {
        processedCount++;
        console.log(
          `🔄 Backend: Processing ${processedCount}/${recentSubmissions.length}: ${submission.titleSlug}`
        );

        const problemDetails = await leetcodeService.getProblemDetails(
          submission.titleSlug
        );

        if (!problemDetails) {
          console.log(
            `⚠️ Backend: No problem details for ${submission.titleSlug}`
          );
          continue;
        }

        let question = await LeetCodeQuestion.findOne({
          titleSlug: submission.titleSlug,
        });

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
            userSolutions: [],
          });
        }

        let userSolution = question.userSolutions.find(
          (sol) => sol.userId.toString() === userId
        );

        if (!userSolution) {
          userSolution = {
            userId: userId,
            isSolved: true,
            submissions: [],
            lastSolvedAt: new Date(submission.timestamp * 1000),
          };
          question.userSolutions.push(userSolution);
        } else {
          userSolution.isSolved = true;
          userSolution.lastSolvedAt = new Date(submission.timestamp * 1000);
        }

        const existingSubmission = userSolution.submissions.find(
          (sub) => sub.submissionId === submission.id
        );
        if (!existingSubmission) {
          userSolution.submissions.push({
            submissionId: submission.id,
            lang: submission.lang,
            timestamp: new Date(submission.timestamp * 1000),
            statusDisplay: submission.statusDisplay,
          });
        }

        await question.save();
        syncedQuestions.push(question);

        // Reduce delay to speed up the process
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error(
          `❌ Backend: Error processing submission ${submission.titleSlug}:`,
          error
        );
        continue;
      }
    }

    // Update user's LeetCode username
    await User.findByIdAndUpdate(userId, { leetcodeUsername });
    console.log("✅ Backend: Updated user LeetCode username");

    console.log(
      `✅ Backend: Sync completed. Synced ${syncedQuestions.length} questions`
    );

    res.json({
      success: true,
      message: `Successfully synced ${syncedQuestions.length} questions from LeetCode`,
      syncedCount: syncedQuestions.length,
      totalSubmissions: recentSubmissions.length,
    });
  } catch (error) {
    console.error("❌ Backend: Error syncing LeetCode data:", error);

    let errorMessage = "Failed to sync LeetCode data";
    if (error.message.includes("User not found")) {
      errorMessage = "LeetCode username not found. Please check your username.";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Request timed out. Please try again.";
    }

    res.status(500).json({ message: errorMessage });
  }
};

exports.getLeetCodeQuestions = async (req, res) => {
  try {
    console.log("🔄 Backend: Fetching LeetCode questions...");

    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      console.log("❌ Backend: No token provided");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log("👤 Backend: User ID:", userId);

    // Check total questions in database
    const totalQuestions = await LeetCodeQuestion.countDocuments();
    console.log("📊 Backend: Total questions in DB:", totalQuestions);

    const questions = await LeetCodeQuestion.find({
      "userSolutions.userId": userId,
    }).sort({ "userSolutions.lastSolvedAt": -1 });

    console.log("📊 Backend: Found user questions in DB:", questions.length);

    const formattedQuestions = questions.map((question) => {
      const userSolution = question.userSolutions.find(
        (sol) => sol.userId.toString() === userId
      );

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
        notes: userSolution?.notes || "",
      };
    });

    console.log(
      "✅ Backend: Returning formatted questions:",
      formattedQuestions.length
    );
    console.log(
      "📋 Backend: Sample question:",
      formattedQuestions[0] || "No questions found"
    );

    res.json(formattedQuestions);
  } catch (error) {
    console.error("❌ Backend: Error fetching LeetCode questions:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLeetCodeQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const question = await LeetCodeQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const userSolution = question.userSolutions.find(
      (sol) => sol.userId.toString() === userId
    );

    const response = {
      ...question.toObject(),
      userSolution: userSolution || {
        isSolved: false,
        submissions: [],
        notes: "",
      },
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

    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const question = await LeetCodeQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    let userSolution = question.userSolutions.find(
      (sol) => sol.userId.toString() === userId
    );

    if (!userSolution) {
      userSolution = {
        userId: userId,
        isSolved: false,
        submissions: [],
        notes: "",
      };
      question.userSolutions.push(userSolution);
    }

    if (code && language) {
      userSolution.submissions.push({
        lang: language,
        code: code,
        timestamp: new Date(),
        statusDisplay: "Accepted",
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
      message: "Solution updated successfully",
    });
  } catch (error) {
    console.error("Error updating solution:", error);
    res.status(500).json({ message: error.message });
  }
};
