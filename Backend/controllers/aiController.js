const AIAnalysis = require('../models/AIAnalysis');
const geminiService = require('../services/geminiService');

const analyzeCode = async (req, res) => {
  try {
    console.log('🔄 AI Analysis request received');
    
    const { question } = req.body;
    const userId = req.user.id;

    if (!question || !question._id || !question.solution || !question.solution.code || !question.solution.language) {
      console.log('❌ Invalid request - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Question object with ID, solution code, and language is required'
      });
    }

    const questionId = question._id;
    const code = question.solution.code;
    const language = question.solution.language;
    const questionTitle = question.title || 'Code Analysis';
    const questionDescription = question.description || '';
    const sampleInput = question.sampleInput || '';
    const sampleOutput = question.sampleOutput || '';
    
    console.log('📝 Analyzing code for question:', questionTitle);
    console.log('💻 Language:', language);
    console.log('👤 User ID:', userId);

    // Check for existing analysis
    let existingAnalysis = await AIAnalysis.findOne({
      questionId,
      userId,
      code: code.trim()
    });

    if (existingAnalysis) {
      console.log('✅ Found existing analysis in cache');
      return res.status(200).json({
        success: true,
        message: 'Analysis retrieved from cache',
        analysis: existingAnalysis,
        fromCache: true
      });
    }
    
    console.log('🔄 Calling Gemini AI service...');
    const aiResults = await geminiService.analyzeCode(
      code, 
      language, 
      questionTitle, 
      questionDescription, 
      sampleInput, 
      sampleOutput
    );

    console.log('✅ AI analysis completed, saving to database...');
    const analysis = new AIAnalysis({
      questionId,
      userId,
      code: code.trim(),
      language,
      ...aiResults
    });
    
    await analysis.save();
    console.log('✅ Analysis saved successfully');

    res.status(200).json({
      success: true,
      message: 'Code analysis completed successfully',
      analysis,
      fromCache: false
    });

  } catch (error) {
    console.error('❌ AI Analysis Error:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Provide more specific error messages
    let userMessage = 'Failed to analyze code';
    
    if (error.message?.includes('API key')) {
      userMessage = 'AI service configuration error. Please contact support.';
    } else if (error.message?.includes('quota')) {
      userMessage = 'AI service quota exceeded. Please try again later.';
    } else if (error.message?.includes('timeout')) {
      userMessage = 'Analysis request timed out. Please try again.';
    } else if (error.name === 'ValidationError') {
      userMessage = 'Invalid code format. Please check your code.';
    }
    
    res.status(500).json({
      success: false,
      message: userMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getAnalysis = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const analyses = await AIAnalysis.find({
      questionId,
      userId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      analyses
    });

  } catch (error) {
    console.error('Get Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analyses',
      error: error.message
    });
  }
};

const getAnalysisById = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user.id;

    const analysis = await AIAnalysis.findOne({
      _id: analysisId,
      userId
    }).populate('questionId', 'title difficulty topic');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Get Analysis By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis',
      error: error.message
    });
  }
};

const deleteAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user.id;

    const analysis = await AIAnalysis.findOneAndDelete({
      _id: analysisId,
      userId
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully'
    });

  } catch (error) {
    console.error('Delete Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete analysis',
      error: error.message
    });
  }
};

const getAnalysisStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await AIAnalysis.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          averageScore: { $avg: '$overallScore' },
          languageBreakdown: {
            $push: '$language'
          }
        }
      }
    ]);

    const languageCounts = {};
    if (stats.length > 0) {
      stats[0].languageBreakdown.forEach(lang => {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalAnalyses: stats[0]?.totalAnalyses || 0,
        averageScore: Math.round(stats[0]?.averageScore || 0),
        languageBreakdown: languageCounts
      }
    });

  } catch (error) {
    console.error('Get Analysis Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis statistics',
      error: error.message
    });
  }
};

module.exports = {
  analyzeCode,
  getAnalysis,
  getAnalysisById,
  deleteAnalysis,
  getAnalysisStats
};