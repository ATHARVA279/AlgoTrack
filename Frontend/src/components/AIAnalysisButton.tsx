import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap } from '../utils/icons';
import axios from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

interface AIAnalysisButtonProps {
  question: any;
  onAnalysisComplete: (analysis: any) => void;
  disabled?: boolean;
}

export const AIAnalysisButton: React.FC<AIAnalysisButtonProps> = ({
  question,
  onAnalysisComplete,
  disabled = false
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!question?.solution?.code?.trim()) {
      toast.error('Please write some code before analyzing');
      return;
    }

    setIsAnalyzing(true);
    const loadingToast = toast.loading('Analyzing your code with AI...');
    
    try {
      console.log('🔄 Sending AI analysis request...');
      console.log('📝 Question:', question.title || question._id);
      
      const response = await axios.post('/api/ai/analyze', {
        question
      }, {
        timeout: 60000 // 60 second timeout
      });

      console.log('✅ AI analysis response:', response.data);

      if (response.data.success) {
        const { analysis, fromCache } = response.data;
        
        toast.dismiss(loadingToast);
        
        if (fromCache) {
          toast.success('Analysis loaded from cache! 🎯');
        } else {
          toast.success('AI analysis completed! 🚀');
        }
        
        onAnalysisComplete(analysis);
      } else {
        toast.dismiss(loadingToast);
        toast.error(response.data.message || 'Failed to analyze code');
      }
    } catch (error: any) {
      console.error('❌ AI Analysis Error:', error);
      toast.dismiss(loadingToast);
      
      let errorMessage = 'Failed to analyze code';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The AI is taking longer than expected. Please try again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid request. Please check your code.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.message || 'AI service error. Please try again later.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      
      // Log additional details for debugging
      console.log('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.button
      onClick={handleAnalyze}
      disabled={disabled || isAnalyzing || !(question?.solution?.code?.trim())}
      whileHover={{ scale: disabled || isAnalyzing ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isAnalyzing ? 1 : 0.98 }}
      className={`
        flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all
        ${disabled || isAnalyzing || !(question?.solution?.code?.trim())
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-neon-purple to-purple-600 text-white hover:from-purple-600 hover:to-neon-purple shadow-lg hover:shadow-purple-500/25'
        }
      `}
    >
      {isAnalyzing ? (
        <>
          <ClipLoader color="#ffffff" size={20} />
          <span>Analyzing Code...</span>
        </>
      ) : (
        <>
          <Brain className="w-5 h-5" />
          <span>Analyze with AI</span>
          <Zap className="w-4 h-4" />
        </>
      )}
    </motion.button>
  );
};