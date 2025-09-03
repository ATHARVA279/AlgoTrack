import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Code2, Award } from '../utils/icons';
import axios from '../utils/axiosInstance';

interface AIStatsData {
  totalAnalyses: number;
  averageScore: number;
  languageBreakdown: Record<string, number>;
}

export const AIStats: React.FC = () => {
  const [stats, setStats] = useState<AIStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/ai/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch AI stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-cyber-darker rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-cyber-darker rounded-lg p-6 text-center">
        <Brain className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">No AI analysis data available</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-cyber-darker rounded-lg p-6 space-y-6"
    >
      <div className="flex items-center space-x-3">
        <Brain className="w-6 h-6 text-neon-purple" />
        <h3 className="text-xl font-bold text-white">AI Analysis Statistics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Analyses */}
        <div className="bg-cyber-black rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Code2 className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Analyses</p>
              <p className="text-2xl font-bold text-white">{stats.totalAnalyses}</p>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-cyber-black rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">Average Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                {stats.averageScore}/100
              </p>
            </div>
          </div>
        </div>

        <div className="bg-cyber-black rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Most Used Language</p>
              <p className="text-lg font-bold text-white">
                {Object.keys(stats.languageBreakdown).length > 0
                  ? Object.entries(stats.languageBreakdown)
                      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
                  : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Breakdown */}
      {Object.keys(stats.languageBreakdown).length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Language Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(stats.languageBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([language, count]) => (
                <div key={language} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{language}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-neon-purple h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(stats.languageBreakdown))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-gray-400 text-sm w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
</content>