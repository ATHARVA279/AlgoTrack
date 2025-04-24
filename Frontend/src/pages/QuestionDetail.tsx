import React from "react";
import { useParams } from "react-router-dom";
import { Clock, BookOpen, Code2, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const mockQuestion = {
  id: "1",
  title: "Two Sum",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  difficulty: "Easy",
  topic: "Arrays",
  sampleInput: `nums = [2,7,11,15], target = 9`,
  sampleOutput: `[0,1]`,
  solutions: [
    {
      id: "1",
      language: "javascript",
      code: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`,
      explanation: `This solution uses a hash map to store the numbers we've seen so far:

1. We iterate through the array once
2. For each number, we calculate its complement (target - current number)
3. If the complement exists in our map, we've found our pair
4. Otherwise, we add the current number to our map
      
Time Complexity: O(n)
Space Complexity: O(n)`,
      createdAt: "2024-03-15T10:00:00Z",
    },
  ],
  status: "Solved",
  createdAt: "2024-03-15T10:00:00Z",
  updatedAt: "2024-03-15T10:00:00Z",
};

const difficultyColors = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-red-400",
};

function QuestionDetail() {
  const { id } = useParams();
  const question = mockQuestion;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 text-gray-400 hover:text-neon-purple transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center space-x-4">
          <span className="px-3 py-1 rounded-full bg-neon-purple/10 text-neon-purple text-sm">
            {question.topic}
          </span>
          <span className={`text-sm ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </span>
        </div>
      </div>

      {/* Question Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card"
      >
        <h1 className="text-3xl font-bold mb-6">{question.title}</h1>

        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{question.description}</ReactMarkdown>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Sample Input:</h3>
            <div className="cyber-card bg-cyber-darker">
              <code className="text-gray-300">{question.sampleInput}</code>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Sample Output:</h3>
            <div className="cyber-card bg-cyber-darker">
              <code className="text-gray-300">{question.sampleOutput}</code>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="cyber-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Solutions</h2>
          <button className="cyber-button flex items-center space-x-2">
            <Code2 className="w-5 h-5" />
            <span>Add Solution</span>
          </button>
        </div>

        {question.solutions.map((solution) => (
          <div key={solution.id} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 rounded-full bg-neon-blue/10 text-neon-blue text-sm">
                  {solution.language}
                </span>
                <span className="text-gray-400">
                  {new Date(solution.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="cyber-card bg-cyber-darker overflow-hidden">
              <SyntaxHighlighter
                language={solution.language}
                style={atomDark}
                customStyle={{
                  background: "transparent",
                  padding: "1.5rem",
                  margin: 0,
                  borderRadius: "0.5rem",
                }}
              >
                {solution.code}
              </SyntaxHighlighter>
            </div>

            <div className="cyber-card bg-gradient-to-r from-neon-purple/5 to-neon-blue/5">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="w-5 h-5 text-neon-purple" />
                <h3 className="text-lg font-semibold">Explanation</h3>
              </div>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{solution.explanation}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default QuestionDetail;
