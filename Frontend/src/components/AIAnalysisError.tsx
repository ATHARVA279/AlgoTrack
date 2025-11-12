import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from '../utils/icons';

interface AIAnalysisErrorProps {
  onRetry?: () => void;
}

export const AIAnalysisError: React.FC<AIAnalysisErrorProps> = ({ onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-cyber-darker rounded-lg p-8 border border-red-500/20"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-red-500/10 rounded-full p-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">AI Analysis Failed</h3>
          <p className="text-gray-400 max-w-md">
            We couldn't analyze your code at this time. This could be due to:
          </p>
        </div>

        <ul className="text-left text-gray-400 space-y-2 bg-cyber-black rounded-lg p-4 max-w-md">
          <li className="flex items-start">
            <span className="text-red-400 mr-2">•</span>
            <span>API rate limits or quota exceeded</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-400 mr-2">•</span>
            <span>Network connectivity issues</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-400 mr-2">•</span>
            <span>Temporary service unavailability</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-400 mr-2">•</span>
            <span>Code complexity exceeding limits</span>
          </li>
        </ul>

        <div className="flex flex-col items-center space-y-3 pt-2">
          <p className="text-sm text-gray-500">
            Please try again after a few minutes
          </p>
          
          {onRetry && (
            <motion.button
              onClick={onRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-neon-purple to-purple-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-neon-purple transition-all shadow-lg hover:shadow-purple-500/25"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </motion.button>
          )}
        </div>

        <div className="pt-4 border-t border-gray-700 mt-4">
          <p className="text-xs text-gray-500">
            💡 Tip: You can still view your code and manually analyze it while we resolve this issue
          </p>
        </div>
      </div>
    </motion.div>
  );
};
