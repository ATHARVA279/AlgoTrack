const express = require('express');
const router = express.Router();
const {
  analyzeCode,
  getAnalysis,
  getAnalysisById,
  deleteAnalysis,
  getAnalysisStats
} = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'AI routes working' });
});

router.post('/analyze', analyzeCode);

router.post('/test-analyze', async (req, res) => {
  try {
    console.log('Test analyze endpoint hit');
    console.log('User:', req.user ? req.user._id : 'No user');
    console.log('Body:', req.body);
    
    const { questionId, code, language } = req.body;
    
    if (!questionId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const mockAnalysis = {
      _id: 'mock-id',
      questionId,
      userId: req.user.id,
      code,
      language,
      lineByLineExplanation: [
        {
          lineNumber: 1,
          code: code.split('\n')[0] || '',
          explanation: 'This is a test explanation'
        }
      ],
      bigOComplexity: {
        time: 'O(n)',
        space: 'O(1)',
        explanation: 'Test complexity analysis'
      },
      codeAnalysis: {
        approach: 'Test approach',
        strengths: ['Test strength'],
        improvements: ['Test improvement'],
        alternativeApproaches: ['Test alternative']
      },
      smartSuggestions: [
        {
          type: 'optimization',
          description: 'Test suggestion',
          relatedTopics: ['test', 'mock']
        }
      ],
      overallScore: 85,
      createdAt: new Date()
    };
    
    res.json({
      success: true,
      message: 'Mock analysis completed',
      analysis: mockAnalysis,
      fromCache: false
    });
    
  } catch (error) {
    console.error('Test analyze error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

router.get('/question/:questionId', getAnalysis);
router.get('/analysis/:analysisId', getAnalysisById);
router.delete('/analysis/:analysisId', deleteAnalysis);
router.get('/stats', getAnalysisStats);

module.exports = router;