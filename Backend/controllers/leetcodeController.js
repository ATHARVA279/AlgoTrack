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

    // Get more submissions but process them efficiently
    const limit = req.body.limit || 50; // Allow custom limit, default to 50
    const recentSubmissions = await leetcodeService.getUserRecentSubmissions(
      leetcodeUsername,
      limit
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
    console.log("🔄 Backend: Fetching ALL LeetCode questions...");

    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      console.log("❌ Backend: No token provided");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log("👤 Backend: User ID:", userId);

    // Get ALL questions from database with NO LIMIT
    const allQuestions = await LeetCodeQuestion.find({})
      .sort({ frontendQuestionId: 1 }) // Sort by question number
      .lean(); // Use lean() for better performance

    console.log("📊 Backend: Total questions in DB:", allQuestions.length);

    const formattedQuestions = allQuestions.map((question) => {
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

    const solvedCount = formattedQuestions.filter(q => q.isSolved).length;

    console.log("✅ Backend: Returning all questions:", formattedQuestions.length);
    console.log("🎯 Backend: User solved:", solvedCount);
    console.log("📋 Backend: Sample question:", formattedQuestions[0] || "No questions found");

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
    console.log("🔄 Backend: Populating popular LeetCode questions...");
    
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

    console.log(`✅ Backend: Added ${addedCount} popular questions`);

    res.json({
      success: true,
      message: `Added ${addedCount} popular LeetCode questions to the database`,
      addedCount
    });

  } catch (error) {
    console.error("❌ Backend: Error populating questions:", error);
    res.status(500).json({ message: error.message });
  }
};