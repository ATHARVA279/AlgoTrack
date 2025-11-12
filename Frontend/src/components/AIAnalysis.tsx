import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Code2, TrendingUp, CheckCircle2, AlertCircle } from '../utils/icons';
import { CodeHighlighter } from './CodeHighlighter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Custom components for ReactMarkdown to render inline code and other elements
const markdownComponents = {
  code: ({ node, inline, className, children, ...props }: any) => {
    if (inline) {
      return (
        <code className="bg-cyber-black text-neon-purple px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  strong: ({ children, ...props }: any) => (
    <strong className="font-bold text-white" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic text-gray-200" {...props}>
      {children}
    </em>
  ),
  p: ({ children, ...props }: any) => (
    <p className="my-2 leading-relaxed" {...props}>
      {children}
    </p>
  ),
};

interface LineExplanation {
  lineNumber: number;
  code: string;
  explanation: string;
}

interface BigOComplexity {
  time: string;
  space: string;
  explanation: string;
}

interface CodeAnalysis {
  approach: string;
  strengths: string[];
  improvements: string[];
  alternativeApproaches: string[];
}

interface SmartSuggestion {
  type: string;
  description: string;
  relatedTopics: string[];
}

interface AIAnalysisData {
  _id: string;
  lineByLineExplanation: LineExplanation[];
  bigOComplexity: BigOComplexity;
  codeAnalysis: CodeAnalysis;
  smartSuggestions: SmartSuggestion[];
  overallScore: number;
  code: string;
  language: string;
  createdAt: string;
}

interface AIAnalysisProps {
  analysis: AIAnalysisData;
  isLoading?: boolean;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysis, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lineByLine' | 'complexity' | 'suggestions'>('overview');

  if (isLoading) {
    return (
      <div className="bg-cyber-darker rounded-lg p-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-neon-purple animate-pulse" />
          <span className="text-lg font-semibold text-white">AI is analyzing your code...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Brain },
    { id: 'lineByLine', label: 'Line by Line', icon: Code2 },
    { id: 'complexity', label: 'Complexity', icon: TrendingUp },
    { id: 'suggestions', label: 'Suggestions', icon: Zap }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-cyber-darker rounded-lg p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-neon-purple" />
          <h3 className="text-xl font-bold text-white">AI Code Analysis</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Overall Score:</span>
          <span className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore}/100
          </span>
        </div>
      </div>

  <div className="flex space-x-1 bg-cyber-black rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-purple text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

  <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Algorithmic Approach</h4>
              <div className="text-gray-300 leading-relaxed prose prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {analysis.codeAnalysis.approach}
                </ReactMarkdown>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {analysis.codeAnalysis.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <div className="flex-1">
                        <ReactMarkdown 
                          className="prose prose-invert prose-sm max-w-none"
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {strength}
                        </ReactMarkdown>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Improvements
                </h4>
                <ul className="space-y-2">
                  {analysis.codeAnalysis.improvements.map((improvement, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      <div className="flex-1">
                        <ReactMarkdown 
                          className="prose prose-invert prose-sm max-w-none"
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {improvement}
                        </ReactMarkdown>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {analysis.codeAnalysis.alternativeApproaches.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-3">Alternative Approaches</h4>
                <ul className="space-y-2">
                  {analysis.codeAnalysis.alternativeApproaches.map((approach, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <div className="flex-1 prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {approach}
                        </ReactMarkdown>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lineByLine' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Line-by-Line Explanation</h4>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analysis.lineByLineExplanation.map((line, index) => (
                <div key={index} className="bg-cyber-black rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <span className="bg-neon-purple text-white text-xs px-2 py-1 rounded font-mono">
                      {line.lineNumber}
                    </span>
                    <div className="flex-1 space-y-2">
                      <CodeHighlighter 
                        code={line.code} 
                        language={analysis.language}
                        customStyle={{ background: 'transparent', padding: '0.5rem' }}
                      />
                      <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {line.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'complexity' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4">Big-O Complexity Analysis</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-cyber-black rounded-lg p-4">
                <h5 className="text-red-400 font-semibold mb-2">Time Complexity</h5>
                <div className="text-2xl font-mono text-white mb-2">{analysis.bigOComplexity.time}</div>
              </div>
              
              <div className="bg-cyber-black rounded-lg p-4">
                <h5 className="text-blue-400 font-semibold mb-2">Space Complexity</h5>
                <div className="text-2xl font-mono text-white mb-2">{analysis.bigOComplexity.space}</div>
              </div>
            </div>

            <div>
              <h5 className="text-lg font-semibold text-white mb-3">Detailed Explanation</h5>
              <div className="text-gray-300 leading-relaxed prose prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {analysis.bigOComplexity.explanation}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Smart Suggestions</h4>
            <div className="space-y-4">
              {analysis.smartSuggestions.map((suggestion, index) => (
                <div key={index} className="bg-cyber-black rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-neon-purple mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-neon-purple text-white text-xs px-2 py-1 rounded uppercase">
                          {suggestion.type}
                        </span>
                      </div>
                      <div className="text-gray-300 mb-3 prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {suggestion.description}
                        </ReactMarkdown>
                      </div>
                      {suggestion.relatedTopics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {suggestion.relatedTopics.map((topic, topicIndex) => (
                            <span
                              key={topicIndex}
                              className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};