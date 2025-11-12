const LeetCodeQuestion = require("../models/LeetCodeQuestion");
const User = require("../models/User");
const leetcodeService = require("../services/leetcodeService");
const jwt = require("jsonwebtoken");

exports.syncAllLeetCodeData = async (req, res) => {
  try {
    let { leetcodeUsername } = req.body;

    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
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


    const { submissions: allSubmissions, profile } = await leetcodeService.getAllUserSolvedProblems(leetcodeUsername);

    if (allSubmissions.length === 0) {
      return res.status(400).json({
        message:
          "No solved problems found. Please check your LeetCode username or make sure you have solved some problems.",
      });
    }

    currentUser.leetcodeProfile = {
      totalSolved: profile.totalSolved,
      easySolved: profile.easySolved,
      mediumSolved: profile.mediumSolved,
      hardSolved: profile.hardSolved,
      lastSyncAt: new Date(),
      ranking: profile.ranking
    };

    currentUser.leetcodeSolvedQuestions = [];

    const syncedQuestions = [];
    let processedCount = 0;

    for (const submission of allSubmissions) {
      try {
  processedCount++;

        const problemDetails = await leetcodeService.getProblemDetails(
          submission.titleSlug
        );

        if (!problemDetails) {
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
          await question.save();
        }

        currentUser.leetcodeSolvedQuestions.push({
          leetcodeQuestionId: question._id,
          titleSlug: submission.titleSlug,
          title: submission.title,
          difficulty: problemDetails.difficulty,
          solvedAt: new Date(submission.timestamp * 1000),
          submissions: [{
            submissionId: submission.id,
            lang: submission.lang,
            timestamp: new Date(submission.timestamp * 1000),
            statusDisplay: submission.statusDisplay,
          }],
          notes: "",
          isFavorite: false,
        });

        syncedQuestions.push(question);

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `❌ Backend: Error processing submission ${submission.titleSlug}:`,
          error
        );
        continue;
      }
    }

    currentUser.leetcodeUsername = leetcodeUsername;
    await currentUser.save();
    console.log("✅ Backend: Updated user LeetCode data");
    console.log("📊 Backend: User now has", currentUser.leetcodeSolvedQuestions.length, "synced questions in DB");

    console.log(
      `✅ Backend: COMPREHENSIVE sync completed. Synced ${syncedQuestions.length} questions`
    );

    const message = profile.apiLimitation 
      ? `Synced ${syncedQuestions.length} questions! ⚠️ LeetCode API only returns recent submissions (${profile.foundSubmissions}/${profile.totalSolved}). This is a known limitation.`
      : `Successfully synced ALL ${syncedQuestions.length} solved questions from LeetCode! 🎉`;

    res.json({
      success: true,
      message,
      syncedCount: syncedQuestions.length,
      totalSubmissions: allSubmissions.length,
      profile: {
        totalSolved: profile.totalSolved,
        foundSubmissions: profile.foundSubmissions,
        easySolved: profile.easySolved,
        mediumSolved: profile.mediumSolved,
        hardSolved: profile.hardSolved,
        apiLimitation: profile.apiLimitation
      }
    });
  } catch (error) {
    console.error("❌ Backend: Error syncing ALL LeetCode data:", error);

    let errorMessage = "Failed to sync all LeetCode data";
    if (error.message.includes("User not found")) {
      errorMessage = "LeetCode username not found. Please check your username.";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Request timed out. This is normal for comprehensive sync. Please try again.";
    }

    res.status(500).json({ message: errorMessage });
  }
};

// Keep the original sync function for quick syncs
exports.syncLeetCodeData = async (req, res) => {
  try {
    console.log("🔄 Backend: Starting quick LeetCode sync...");
    let { leetcodeUsername } = req.body;

    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
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

    // Quick sync - just recent submissions
    const recentSubmissions = await leetcodeService.getUserRecentSubmissions(leetcodeUsername, 50);
    
    if (recentSubmissions.length === 0) {
      return res.status(400).json({
        message: "No recent submissions found. Try the 'Sync All Data' option for comprehensive sync.",
      });
    }

    let syncedCount = 0;
    for (const submission of recentSubmissions) {
      try {
        // Check if user already has this question
        const existingQuestion = currentUser.leetcodeSolvedQuestions.find(
          q => q.titleSlug === submission.titleSlug
        );

        if (!existingQuestion) {
          const problemDetails = await leetcodeService.getProblemDetails(submission.titleSlug);
          if (problemDetails) {
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
                userSolutions: [],
              });
              await question.save();
            }

            currentUser.leetcodeSolvedQuestions.push({
              leetcodeQuestionId: question._id,
              titleSlug: submission.titleSlug,
              title: submission.title,
              difficulty: problemDetails.difficulty,
              solvedAt: new Date(submission.timestamp * 1000),
              submissions: [{
                submissionId: submission.id,
                lang: submission.lang,
                timestamp: new Date(submission.timestamp * 1000),
                statusDisplay: submission.statusDisplay,
              }],
              notes: "",
              isFavorite: false,
            });
            syncedCount++;
          }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing ${submission.titleSlug}:`, error);
      }
    }

    currentUser.leetcodeUsername = leetcodeUsername;
    await currentUser.save();

    res.json({
      success: true,
      message: `Quick sync completed! Added ${syncedCount} new questions. Use 'Sync All Data' for comprehensive sync.`,
      syncedCount,
      totalSubmissions: recentSubmissions.length,
    });

  } catch (error) {
    console.error("❌ Backend: Error in quick sync:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLeetCodeQuestions = async (req, res) => {
  try {
    console.log("🔄 Backend: Fetching user's LeetCode solved questions...");

    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      console.log("❌ Backend: No token provided");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log("👤 Backend: User ID:", userId);

    // Get user with their solved LeetCode questions
    const user = await User.findById(userId)
      .populate('leetcodeSolvedQuestions.leetcodeQuestionId')
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("📊 Backend: User's solved questions:", user.leetcodeSolvedQuestions?.length || 0);
    console.log("🔍 Backend: Raw leetcodeSolvedQuestions array:", JSON.stringify(user.leetcodeSolvedQuestions?.slice(0, 2), null, 2));

    // If user has no synced questions, return empty array with helpful message
    if (!user.leetcodeSolvedQuestions || user.leetcodeSolvedQuestions.length === 0) {
      console.log("⚠️ Backend: User has no synced LeetCode questions yet");
      return res.json({
        questions: [],
        profile: user.leetcodeProfile || {
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          lastSyncAt: null,
          ranking: null
        },
        message: "No synced questions found. Use 'Sync ALL Data' to import your solved problems from LeetCode."
      });
    }

    // Format the user's solved questions
    const formattedQuestions = user.leetcodeSolvedQuestions.map((solvedQ) => {
      const questionDetails = solvedQ.leetcodeQuestionId;
      
      // Get the most recent submission for preview
      const latestSubmission = solvedQ.submissions && solvedQ.submissions.length > 0
        ? solvedQ.submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
        : null;
      
      return {
        _id: questionDetails?._id || solvedQ.leetcodeQuestionId,
        questionId: questionDetails?.questionId,
        frontendQuestionId: questionDetails?.frontendQuestionId,
        title: solvedQ.title,
        titleSlug: solvedQ.titleSlug,
        difficulty: solvedQ.difficulty,
        topicTags: questionDetails?.topicTags || [],
        categoryTitle: questionDetails?.categoryTitle || "Algorithms",
        isSolved: true, // All questions in this list are solved
        lastSolvedAt: solvedQ.solvedAt,
        submissionCount: solvedQ.submissions?.length || 0,
        latestSubmission: latestSubmission ? {
          lang: latestSubmission.lang,
          timestamp: latestSubmission.timestamp,
          statusDisplay: latestSubmission.statusDisplay,
        } : null,
        notes: solvedQ.notes || "",
        isFavorite: solvedQ.isFavorite || false,
        content: questionDetails?.content,
        hints: questionDetails?.hints || [],
      };
    });

    // Sort by latest solved date (newest first)
    formattedQuestions.sort((a, b) => {
      const dateA = new Date(a.lastSolvedAt);
      const dateB = new Date(b.lastSolvedAt);
      return dateB - dateA;
    });

    console.log("✅ Backend: Returning user's solved questions:", formattedQuestions.length);
    console.log("📊 Backend: Profile stats:", user.leetcodeProfile);

    res.json({
      questions: formattedQuestions,
      profile: user.leetcodeProfile || {
        totalSolved: formattedQuestions.length,
        easySolved: formattedQuestions.filter(q => q.difficulty === 'Easy').length,
        mediumSolved: formattedQuestions.filter(q => q.difficulty === 'Medium').length,
        hardSolved: formattedQuestions.filter(q => q.difficulty === 'Hard').length,
        lastSyncAt: null,
        ranking: null
      }
    });
  } catch (error) {
    console.error("❌ Backend: Error fetching LeetCode questions:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLeetCodeQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid question id" });
    }
    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get user with their solved question data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the question in the LeetCodeQuestion collection
    const question = await LeetCodeQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Find the user's solved data for this question
    const userSolvedData = user.leetcodeSolvedQuestions.find(
      (solvedQ) => solvedQ.leetcodeQuestionId.toString() === id
    );

    const response = {
      ...question.toObject(),
      userSolution: userSolvedData ? {
        isSolved: true,
        submissions: userSolvedData.submissions || [],
        notes: userSolvedData.notes || "",
        isFavorite: userSolvedData.isFavorite || false,
        lastSolvedAt: userSolvedData.solvedAt,
      } : {
        isSolved: false,
        submissions: [],
        notes: "",
        isFavorite: false,
        lastSolvedAt: null,
      },
    };

    console.log("✅ Fetched question details for:", question.title, "User has solved:", !!userSolvedData);

    res.json(response);
  } catch (error) {
    console.error("Error fetching LeetCode question:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.syncMoreLeetCodeData = async (req, res) => {
  try {
    console.log("🔄 Backend: Starting extended LeetCode sync...");
    let { leetcodeUsername, limit = 100 } = req.body;
    
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

    console.log(`🔗 Backend: Extended sync for ${leetcodeUsername} (limit: ${limit})`);

    // Get more submissions for extended sync
    const recentSubmissions = await leetcodeService.getUserRecentSubmissions(leetcodeUsername, limit);
    console.log("📊 Backend: Found submissions for extended sync:", recentSubmissions.length);
    
    if (recentSubmissions.length === 0) {
      return res.status(400).json({ 
        message: "No additional submissions found." 
      });
    }

    const syncedQuestions = [];
    let processedCount = 0;
    let skippedCount = 0;

    for (const submission of recentSubmissions) {
      try {
        processedCount++;
        
        // Check if we already have this question for this user
        const existingQuestion = await LeetCodeQuestion.findOne({ 
          titleSlug: submission.titleSlug,
          "userSolutions.userId": userId
        });
        
        if (existingQuestion) {
          skippedCount++;
          console.log(`⏭️ Backend: Skipping existing question: ${submission.titleSlug}`);
          continue;
        }
        
        console.log(`🔄 Backend: Processing new question ${processedCount}/${recentSubmissions.length}: ${submission.titleSlug}`);
        
        const problemDetails = await leetcodeService.getProblemDetails(submission.titleSlug);
        
        if (!problemDetails) {
          console.log(`⚠️ Backend: No problem details for ${submission.titleSlug}`);
          continue;
        }

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

        const userSolution = {
          userId: userId,
          isSolved: true,
          submissions: [{
            submissionId: submission.id,
            lang: submission.lang,
            timestamp: new Date(submission.timestamp * 1000),
            statusDisplay: submission.statusDisplay
          }],
          lastSolvedAt: new Date(submission.timestamp * 1000)
        };
        
        question.userSolutions.push(userSolution);
        await question.save();
        syncedQuestions.push(question);

        // Reduce delay for faster processing
        await new Promise(resolve => setTimeout(resolve, 30));
        
      } catch (error) {
        console.error(`❌ Backend: Error processing submission ${submission.titleSlug}:`, error);
        continue;
      }
    }

    console.log(`✅ Backend: Extended sync completed. New questions: ${syncedQuestions.length}, Skipped: ${skippedCount}`);

    res.json({
      success: true,
      message: `Extended sync completed! Added ${syncedQuestions.length} new questions (${skippedCount} already existed)`,
      newQuestions: syncedQuestions.length,
      skippedQuestions: skippedCount,
      totalProcessed: processedCount
    });

  } catch (error) {
    console.error("❌ Backend: Error in extended sync:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.addManualQuestion = async (req, res) => {
  try {
    const { title, titleSlug, difficulty, notes } = req.body;

    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has this question
    const existingQuestion = currentUser.leetcodeSolvedQuestions.find(
      q => q.titleSlug === titleSlug || q.title === title
    );

    if (existingQuestion) {
      return res.status(400).json({ message: "Question already exists in your list" });
    }

    // Try to get question details from LeetCode API if titleSlug is provided
    let questionDetails = null;
    if (titleSlug) {
      try {
        questionDetails = await leetcodeService.getProblemDetails(titleSlug);
      } catch (error) {
        console.log("Could not fetch question details from LeetCode API");
      }
    }

    // Create or find the question in global collection
    let question = null;
    if (questionDetails) {
      question = await LeetCodeQuestion.findOne({ titleSlug });
      if (!question) {
        question = new LeetCodeQuestion({
          questionId: questionDetails.questionId,
          frontendQuestionId: questionDetails.questionFrontendId,
          title: questionDetails.title,
          titleSlug: questionDetails.titleSlug,
          content: questionDetails.content,
          difficulty: questionDetails.difficulty,
          topicTags: questionDetails.topicTags,
          categoryTitle: questionDetails.categoryTitle,
          likes: questionDetails.likes,
          dislikes: questionDetails.dislikes,
          sampleTestCase: questionDetails.sampleTestCase,
          exampleTestcases: questionDetails.exampleTestcases,
          hints: questionDetails.hints,
          userSolutions: [],
        });
        await question.save();
      }
    }

    // Add to user's solved questions
    currentUser.leetcodeSolvedQuestions.push({
      leetcodeQuestionId: question?._id,
      titleSlug: titleSlug || title.toLowerCase().replace(/\s+/g, '-'),
      title: title,
      difficulty: difficulty || (questionDetails?.difficulty) || 'Medium',
      solvedAt: new Date(),
      submissions: [],
      notes: notes || "",
      isFavorite: false,
    });

    await currentUser.save();

    res.json({
      success: true,
      message: `Successfully added "${title}" to your solved questions!`,
    });

  } catch (error) {
    console.error("Error adding manual question:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserSolution = async (req, res) => {
  try {
    console.log("🎯 updateUserSolution function called");
    const { id } = req.params;
    const { code, language, notes, isSolved } = req.body;
    console.log("📋 Parameters - ID:", id, "Language:", language, "isSolved:", isSolved);

    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const leetcodeQuestion = await LeetCodeQuestion.findById(id);
    if (!leetcodeQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update the LeetCode question's user solution (keep existing functionality)
    let userSolution = leetcodeQuestion.userSolutions.find(
      (sol) => sol.userId.toString() === userId
    );

    if (!userSolution) {
      userSolution = {
        userId: userId,
        isSolved: false,
        submissions: [],
        notes: "",
      };
      leetcodeQuestion.userSolutions.push(userSolution);
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

    await leetcodeQuestion.save();

    console.log("✅ Solution updated successfully for question:", leetcodeQuestion.title);

    res.json({
      success: true,
      message: "Solution updated successfully",
    });
  } catch (error) {
    console.error("Error updating solution:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getQuestionsCount = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const totalQuestions = await LeetCodeQuestion.countDocuments({});
    const solvedQuestions = await LeetCodeQuestion.countDocuments({
      "userSolutions.userId": userId,
      "userSolutions.isSolved": true
    });

    console.log(`📊 Backend: Total questions: ${totalQuestions}, User solved: ${solvedQuestions}`);

    res.json({
      total: totalQuestions,
      solved: solvedQuestions,
      remaining: totalQuestions - solvedQuestions
    });
  } catch (error) {
    console.error("❌ Backend: Error getting questions count:", error);
    res.status(500).json({ message: error.message });
  }
};

// Production-ready: All LeetCode questions are synced directly from users' actual LeetCode accounts
// via the sync endpoints. No hardcoded example data needed.
