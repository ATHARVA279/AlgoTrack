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
    
    try {
      const response = await axios.post('/api/ai/analyze', {
        question
      });

      if (response.data.success) {
        const { analysis, fromCache } = response.data;
        
        if (fromCache) {
          toast.success('Analysis loaded from cache!');
        } else {
          toast.success('AI analysis completed!');
        }
        
        onAnalysisComplete(analysis);
      } else {
        toast.error('Failed to analyze code');
      }
    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to analyze code';
      toast.error(errorMessage);
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