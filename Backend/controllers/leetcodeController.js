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

    // Update user's LeetCode username and save all data
    currentUser.leetcodeUsername = leetcodeUsername;
    await currentUser.save();
    console.log("✅ Backend: Updated user LeetCode data");

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
        notes: solvedQ.notes || "",
        isFavorite: solvedQ.isFavorite || false,
        content: questionDetails?.content,
        hints: questionDetails?.hints || [],
      };
    });

    // Sort by question number if available, otherwise by solved date
    formattedQuestions.sort((a, b) => {
      if (a.frontendQuestionId && b.frontendQuestionId) {
        return parseInt(a.frontendQuestionId) - parseInt(b.frontendQuestionId);
      }
      return new Date(b.lastSolvedAt) - new Date(a.lastSolvedAt);
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

    console.log("✅ Fetched question details for:", question.title, "User solution exists:", !!userSolution);

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

exports.populatePopularQuestions = async (req, res) => {
  try {
    console.log("🔄 Backend: Populating comprehensive LeetCode questions...");
    
    const popularQuestions = [
      {
        questionId: "1",
        frontendQuestionId: "1",
        title: "Two Sum",
        titleSlug: "two-sum",
        content: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Hash Table", slug: "hash-table" }
        ],
        categoryTitle: "Algorithms",
        likes: 45000,
        dislikes: 1500,
        hints: ["A really brute force way would be to search for all possible pairs of numbers but that would be too slow.", "Again, the best way would be to use a HashMap."],
        userSolutions: []
      },
      {
        questionId: "2",
        frontendQuestionId: "2",
        title: "Add Two Numbers",
        titleSlug: "add-two-numbers",
        content: "You are given two non-empty linked lists representing two non-negative integers.",
        difficulty: "Medium",
        topicTags: [
          { name: "Linked List", slug: "linked-list" },
          { name: "Math", slug: "math" }
        ],
        categoryTitle: "Algorithms",
        likes: 25000,
        dislikes: 5000,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "3",
        frontendQuestionId: "3",
        title: "Longest Substring Without Repeating Characters",
        titleSlug: "longest-substring-without-repeating-characters",
        content: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "Medium",
        topicTags: [
          { name: "Hash Table", slug: "hash-table" },
          { name: "String", slug: "string" },
          { name: "Sliding Window", slug: "sliding-window" }
        ],
        categoryTitle: "Algorithms",
        likes: 35000,
        dislikes: 1200,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "4",
        frontendQuestionId: "4",
        title: "Median of Two Sorted Arrays",
        titleSlug: "median-of-two-sorted-arrays",
        content: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
        difficulty: "Hard",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Binary Search", slug: "binary-search" },
          { name: "Divide and Conquer", slug: "divide-and-conquer" }
        ],
        categoryTitle: "Algorithms",
        likes: 20000,
        dislikes: 2500,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "5",
        frontendQuestionId: "5",
        title: "Longest Palindromic Substring",
        titleSlug: "longest-palindromic-substring",
        content: "Given a string s, return the longest palindromic substring in s.",
        difficulty: "Medium",
        topicTags: [
          { name: "String", slug: "string" },
          { name: "Dynamic Programming", slug: "dynamic-programming" }
        ],
        categoryTitle: "Algorithms",
        likes: 25000,
        dislikes: 1500,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "20",
        frontendQuestionId: "20",
        title: "Valid Parentheses",
        titleSlug: "valid-parentheses",
        content: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "Easy",
        topicTags: [
          { name: "String", slug: "string" },
          { name: "Stack", slug: "stack" }
        ],
        categoryTitle: "Algorithms",
        likes: 18000,
        dislikes: 1000,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "21",
        frontendQuestionId: "21",
        title: "Merge Two Sorted Lists",
        titleSlug: "merge-two-sorted-lists",
        content: "You are given the heads of two sorted linked lists list1 and list2.",
        difficulty: "Easy",
        topicTags: [
          { name: "Linked List", slug: "linked-list" },
          { name: "Recursion", slug: "recursion" }
        ],
        categoryTitle: "Algorithms",
        likes: 15000,
        dislikes: 1200,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "53",
        frontendQuestionId: "53",
        title: "Maximum Subarray",
        titleSlug: "maximum-subarray",
        content: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Divide and Conquer", slug: "divide-and-conquer" },
          { name: "Dynamic Programming", slug: "dynamic-programming" }
        ],
        categoryTitle: "Algorithms",
        likes: 28000,
        dislikes: 1300,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "70",
        frontendQuestionId: "70",
        title: "Climbing Stairs",
        titleSlug: "climbing-stairs",
        content: "You are climbing a staircase. It takes n steps to reach the top.",
        difficulty: "Easy",
        topicTags: [
          { name: "Math", slug: "math" },
          { name: "Dynamic Programming", slug: "dynamic-programming" },
          { name: "Memoization", slug: "memoization" }
        ],
        categoryTitle: "Algorithms",
        likes: 16000,
        dislikes: 500,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "121",
        frontendQuestionId: "121",
        title: "Best Time to Buy and Sell Stock",
        titleSlug: "best-time-to-buy-and-sell-stock",
        content: "You are given an array prices where prices[i] is the price of a given stock on the ith day.",
        difficulty: "Easy",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Dynamic Programming", slug: "dynamic-programming" }
        ],
        categoryTitle: "Algorithms",
        likes: 22000,
        dislikes: 700,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "125",
        frontendQuestionId: "125",
        title: "Valid Palindrome",
        titleSlug: "valid-palindrome",
        content: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
        difficulty: "Easy",
        topicTags: [
          { name: "Two Pointers", slug: "two-pointers" },
          { name: "String", slug: "string" }
        ],
        categoryTitle: "Algorithms",
        likes: 7000,
        dislikes: 6000,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "141",
        frontendQuestionId: "141",
        title: "Linked List Cycle",
        titleSlug: "linked-list-cycle",
        content: "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
        difficulty: "Easy",
        topicTags: [
          { name: "Hash Table", slug: "hash-table" },
          { name: "Linked List", slug: "linked-list" },
          { name: "Two Pointers", slug: "two-pointers" }
        ],
        categoryTitle: "Algorithms",
        likes: 12000,
        dislikes: 900,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "206",
        frontendQuestionId: "206",
        title: "Reverse Linked List",
        titleSlug: "reverse-linked-list",
        content: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        difficulty: "Easy",
        topicTags: [
          { name: "Linked List", slug: "linked-list" },
          { name: "Recursion", slug: "recursion" }
        ],
        categoryTitle: "Algorithms",
        likes: 17000,
        dislikes: 300,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "217",
        frontendQuestionId: "217",
        title: "Contains Duplicate",
        titleSlug: "contains-duplicate",
        content: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
        difficulty: "Easy",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Hash Table", slug: "hash-table" },
          { name: "Sorting", slug: "sorting" }
        ],
        categoryTitle: "Algorithms",
        likes: 8000,
        dislikes: 1100,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "226",
        frontendQuestionId: "226",
        title: "Invert Binary Tree",
        titleSlug: "invert-binary-tree",
        content: "Given the root of a binary tree, invert the tree, and return its root.",
        difficulty: "Easy",
        topicTags: [
          { name: "Tree", slug: "tree" },
          { name: "Depth-First Search", slug: "depth-first-search" },
          { name: "Breadth-First Search", slug: "breadth-first-search" },
          { name: "Binary Tree", slug: "binary-tree" }
        ],
        categoryTitle: "Algorithms",
        likes: 11000,
        dislikes: 150,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "242",
        frontendQuestionId: "242",
        title: "Valid Anagram",
        titleSlug: "valid-anagram",
        content: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
        difficulty: "Easy",
        topicTags: [
          { name: "Hash Table", slug: "hash-table" },
          { name: "String", slug: "string" },
          { name: "Sorting", slug: "sorting" }
        ],
        categoryTitle: "Algorithms",
        likes: 9000,
        dislikes: 300,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "704",
        frontendQuestionId: "704",
        title: "Binary Search",
        titleSlug: "binary-search",
        content: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.",
        difficulty: "Easy",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Binary Search", slug: "binary-search" }
        ],
        categoryTitle: "Algorithms",
        likes: 8500,
        dislikes: 180,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "733",
        frontendQuestionId: "733",
        title: "Flood Fill",
        titleSlug: "flood-fill",
        content: "An image is represented by an m x n integer grid image where image[i][j] represents the pixel value of the image.",
        difficulty: "Easy",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Depth-First Search", slug: "depth-first-search" },
          { name: "Breadth-First Search", slug: "breadth-first-search" },
          { name: "Matrix", slug: "matrix" }
        ],
        categoryTitle: "Algorithms",
        likes: 6000,
        dislikes: 600,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "235",
        frontendQuestionId: "235",
        title: "Lowest Common Ancestor of a Binary Search Tree",
        titleSlug: "lowest-common-ancestor-of-a-binary-search-tree",
        content: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.",
        difficulty: "Medium",
        topicTags: [
          { name: "Tree", slug: "tree" },
          { name: "Depth-First Search", slug: "depth-first-search" },
          { name: "Binary Search Tree", slug: "binary-search-tree" },
          { name: "Binary Tree", slug: "binary-tree" }
        ],
        categoryTitle: "Algorithms",
        likes: 8500,
        dislikes: 250,
        hints: [],
        userSolutions: []
      },
      // Add more comprehensive questions
      {
        questionId: "15",
        frontendQuestionId: "15",
        title: "3Sum",
        titleSlug: "3sum",
        content: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Two Pointers", slug: "two-pointers" },
          { name: "Sorting", slug: "sorting" }
        ],
        categoryTitle: "Algorithms",
        likes: 24000,
        dislikes: 2200,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "11",
        frontendQuestionId: "11",
        title: "Container With Most Water",
        titleSlug: "container-with-most-water",
        content: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Two Pointers", slug: "two-pointers" },
          { name: "Greedy", slug: "greedy" }
        ],
        categoryTitle: "Algorithms",
        likes: 22000,
        dislikes: 1200,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "42",
        frontendQuestionId: "42",
        title: "Trapping Rain Water",
        titleSlug: "trapping-rain-water",
        content: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        difficulty: "Hard",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Two Pointers", slug: "two-pointers" },
          { name: "Dynamic Programming", slug: "dynamic-programming" },
          { name: "Stack", slug: "stack" },
          { name: "Monotonic Stack", slug: "monotonic-stack" }
        ],
        categoryTitle: "Algorithms",
        likes: 26000,
        dislikes: 380,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "49",
        frontendQuestionId: "49",
        title: "Group Anagrams",
        titleSlug: "group-anagrams",
        content: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Hash Table", slug: "hash-table" },
          { name: "String", slug: "string" },
          { name: "Sorting", slug: "sorting" }
        ],
        categoryTitle: "Algorithms",
        likes: 15000,
        dislikes: 440,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "76",
        frontendQuestionId: "76",
        title: "Minimum Window Substring",
        titleSlug: "minimum-window-substring",
        content: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
        difficulty: "Hard",
        topicTags: [
          { name: "Hash Table", slug: "hash-table" },
          { name: "String", slug: "string" },
          { name: "Sliding Window", slug: "sliding-window" }
        ],
        categoryTitle: "Algorithms",
        likes: 14000,
        dislikes: 600,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "102",
        frontendQuestionId: "102",
        title: "Binary Tree Level Order Traversal",
        titleSlug: "binary-tree-level-order-traversal",
        content: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
        difficulty: "Medium",
        topicTags: [
          { name: "Tree", slug: "tree" },
          { name: "Breadth-First Search", slug: "breadth-first-search" },
          { name: "Binary Tree", slug: "binary-tree" }
        ],
        categoryTitle: "Algorithms",
        likes: 12000,
        dislikes: 240,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "104",
        frontendQuestionId: "104",
        title: "Maximum Depth of Binary Tree",
        titleSlug: "maximum-depth-of-binary-tree",
        content: "Given the root of a binary tree, return its maximum depth.",
        difficulty: "Easy",
        topicTags: [
          { name: "Tree", slug: "tree" },
          { name: "Depth-First Search", slug: "depth-first-search" },
          { name: "Breadth-First Search", slug: "breadth-first-search" },
          { name: "Binary Tree", slug: "binary-tree" }
        ],
        categoryTitle: "Algorithms",
        likes: 10000,
        dislikes: 160,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "136",
        frontendQuestionId: "136",
        title: "Single Number",
        titleSlug: "single-number",
        content: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.",
        difficulty: "Easy",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Bit Manipulation", slug: "bit-manipulation" }
        ],
        categoryTitle: "Algorithms",
        likes: 13000,
        dislikes: 500,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "152",
        frontendQuestionId: "152",
        title: "Maximum Product Subarray",
        titleSlug: "maximum-product-subarray",
        content: "Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return the product.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Dynamic Programming", slug: "dynamic-programming" }
        ],
        categoryTitle: "Algorithms",
        likes: 14000,
        dislikes: 450,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "153",
        frontendQuestionId: "153",
        title: "Find Minimum in Rotated Sorted Array",
        titleSlug: "find-minimum-in-rotated-sorted-array",
        content: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Binary Search", slug: "binary-search" }
        ],
        categoryTitle: "Algorithms",
        likes: 10000,
        dislikes: 450,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "167",
        frontendQuestionId: "167",
        title: "Two Sum II - Input Array Is Sorted",
        titleSlug: "two-sum-ii-input-array-is-sorted",
        content: "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Two Pointers", slug: "two-pointers" },
          { name: "Binary Search", slug: "binary-search" }
        ],
        categoryTitle: "Algorithms",
        likes: 8500,
        dislikes: 1200,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "198",
        frontendQuestionId: "198",
        title: "House Robber",
        titleSlug: "house-robber",
        content: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Dynamic Programming", slug: "dynamic-programming" }
        ],
        categoryTitle: "Algorithms",
        likes: 17000,
        dislikes: 350,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "200",
        frontendQuestionId: "200",
        title: "Number of Islands",
        titleSlug: "number-of-islands",
        content: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Depth-First Search", slug: "depth-first-search" },
          { name: "Breadth-First Search", slug: "breadth-first-search" },
          { name: "Union Find", slug: "union-find" },
          { name: "Matrix", slug: "matrix" }
        ],
        categoryTitle: "Algorithms",
        likes: 19000,
        dislikes: 430,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "238",
        frontendQuestionId: "238",
        title: "Product of Array Except Self",
        titleSlug: "product-of-array-except-self",
        content: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Prefix Sum", slug: "prefix-sum" }
        ],
        categoryTitle: "Algorithms",
        likes: 18000,
        dislikes: 1100,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "268",
        frontendQuestionId: "268",
        title: "Missing Number",
        titleSlug: "missing-number",
        content: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
        difficulty: "Easy",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Hash Table", slug: "hash-table" },
          { name: "Math", slug: "math" },
          { name: "Binary Search", slug: "binary-search" },
          { name: "Bit Manipulation", slug: "bit-manipulation" },
          { name: "Sorting", slug: "sorting" }
        ],
        categoryTitle: "Algorithms",
        likes: 9000,
        dislikes: 3000,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "300",
        frontendQuestionId: "300",
        title: "Longest Increasing Subsequence",
        titleSlug: "longest-increasing-subsequence",
        content: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Binary Search", slug: "binary-search" },
          { name: "Dynamic Programming", slug: "dynamic-programming" }
        ],
        categoryTitle: "Algorithms",
        likes: 16000,
        dislikes: 300,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "322",
        frontendQuestionId: "322",
        title: "Coin Change",
        titleSlug: "coin-change",
        content: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Dynamic Programming", slug: "dynamic-programming" },
          { name: "Breadth-First Search", slug: "breadth-first-search" }
        ],
        categoryTitle: "Algorithms",
        likes: 15000,
        dislikes: 350,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "347",
        frontendQuestionId: "347",
        title: "Top K Frequent Elements",
        titleSlug: "top-k-frequent-elements",
        content: "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Hash Table", slug: "hash-table" },
          { name: "Divide and Conquer", slug: "divide-and-conquer" },
          { name: "Sorting", slug: "sorting" },
          { name: "Heap (Priority Queue)", slug: "heap-priority-queue" },
          { name: "Bucket Sort", slug: "bucket-sort" },
          { name: "Counting", slug: "counting" },
          { name: "Quickselect", slug: "quickselect" }
        ],
        categoryTitle: "Algorithms",
        likes: 13000,
        dislikes: 500,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "371",
        frontendQuestionId: "371",
        title: "Sum of Two Integers",
        titleSlug: "sum-of-two-integers",
        content: "Given two integers a and b, return the sum of the two integers without using the operators + and -.",
        difficulty: "Medium",
        topicTags: [
          { name: "Math", slug: "math" },
          { name: "Bit Manipulation", slug: "bit-manipulation" }
        ],
        categoryTitle: "Algorithms",
        likes: 3500,
        dislikes: 4200,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "383",
        frontendQuestionId: "383",
        title: "Ransom Note",
        titleSlug: "ransom-note",
        content: "Given two strings ransomNote and magazine, return true if ransomNote can be constructed by using the letters from magazine and false otherwise.",
        difficulty: "Easy",
        topicTags: [
          { name: "Hash Table", slug: "hash-table" },
          { name: "String", slug: "string" },
          { name: "Counting", slug: "counting" }
        ],
        categoryTitle: "Algorithms",
        likes: 4000,
        dislikes: 400,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "417",
        frontendQuestionId: "417",
        title: "Pacific Atlantic Water Flow",
        titleSlug: "pacific-atlantic-water-flow",
        content: "There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean.",
        difficulty: "Medium",
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Depth-First Search", slug: "depth-first-search" },
          { name: "Breadth-First Search", slug: "breadth-first-search" },
          { name: "Matrix", slug: "matrix" }
        ],
        categoryTitle: "Algorithms",
        likes: 6500,
        dislikes: 1200,
        hints: [],
        userSolutions: []
      },
      {
        questionId: "424",
        frontendQuestionId: "424",
        title: "Longest Repeating Character Replacement",
        titleSlug: "longest-repeating-character-replacement",
        content: "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character.",
        difficulty: "Medium",
        topicTags: [
          { name: "Hash Table", slug: "hash-table" },
          { name: "String", slug: "string" },
          { name: "Sliding Window", slug: "sliding-window" }
        ],
        categoryTitle: "Algorithms",
        likes: 8000,
        dislikes: 350,
        hints: [],
        userSolutions: []
      }
    ];

    let addedCount = 0;
    
    for (const questionData of popularQuestions) {
      const existingQuestion = await LeetCodeQuestion.findOne({ titleSlug: questionData.titleSlug });
      
      if (!existingQuestion) {
        const newQuestion = new LeetCodeQuestion(questionData);
        await newQuestion.save();
        addedCount++;
        console.log(`✅ Added: ${questionData.title}`);
      } else {
        console.log(`⚠️ Already exists: ${questionData.title}`);
      }
    }

    console.log(`✅ Backend: Added ${addedCount} comprehensive questions`);

    res.json({
      success: true,
      message: `Added ${addedCount} comprehensive LeetCode questions to the database! Now you have ${addedCount > 0 ? 'many more' : 'all available'} questions to practice.`,
      addedCount,
      totalAvailable: popularQuestions.length
    });

  } catch (error) {
    console.error("❌ Backend: Error populating questions:", error);
    res.status(500).json({ message: error.message });
  }
};