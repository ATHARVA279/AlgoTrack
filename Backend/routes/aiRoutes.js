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

router.get('/question/:questionId', getAnalysis);
router.get('/analysis/:analysisId', getAnalysisById);
router.delete('/analysis/:analysisId', deleteAnalysis);
router.get('/stats', getAnalysisStats);

module.exports = router;