import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Save, CheckCircle2, Circle } from "../utils/icons";
import Editor from "@monaco-editor/react";
import axios from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { AIAnalysis } from "../components/AIAnalysis";
import { AIAnalysisButton } from "../components/AIAnalysisButton";

interface LeetCodeQuestion {
  _id: string;
  questionId: string;
  frontendQuestionId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topicTags: { name: string; slug: string }[];
  categoryTitle: string;
  sampleTestCase: string;
  exampleTestcases: string;
  hints: string[];
  userSolution: {
    isSolved: boolean;
    submissions: Array<{
      lang: string;
      code: string;
      timestamp: string;
      statusDisplay: string;
    }>;
    notes: string;
  };
}

export default function LeetCodeQuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<LeetCodeQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
  ];

  const fetchQuestionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/leetcode/questions/${id}`);
      setQuestion(response.data);
    } catch (error) {
      console.error("Error fetching question details:", error);
      toast.error("Failed to fetch question details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchQuestionDetails();
    }
  }, [id, fetchQuestionDetails]);

  useEffect(() => {
    if (question) {
      setNotes(question.userSolution.notes || "");
      setIsSolved(question.userSolution.isSolved);
      
      const latestSubmission = question.userSolution.submissions
        .filter(sub => sub.lang === selectedLanguage)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      if (latestSubmission) {
        setCode(latestSubmission.code || "");
      } else {
        setCode(getDefaultCode(selectedLanguage));
      }
    }
  }, [question, selectedLanguage]);

  const getDefaultCode = (language: string) => {
    const templates = {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var solution = function(nums) {
    // Your code here
};`,
      python: `class Solution:
    def solution(self, nums: List[int]) -> int:
        # Your code here
        pass`,
      java: `class Solution {
    public int solution(int[] nums) {
        // Your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int solution(vector<int>& nums) {
        // Your code here
        return 0;
    }
};`,
      c: `int solution(int* nums, int numsSize) {
    // Your code here
    return 0;
}`
    };
    return templates[language as keyof typeof templates] || "";
  };

  const saveSolution = async () => {
    if (!question) return;

    console.log("🎯 Frontend: saveSolution called");

    try {
      setSaving(true);

      // First, save to LeetCode question (existing functionality)
      await axios.put(`/api/leetcode/questions/${question._id}/solution`, {
        code: code.trim(),
        language: selectedLanguage,
        notes: notes.trim(),
        isSolved
      });

      // If marked as solved and has code, also add to manual questions collection
      if (isSolved && code.trim()) {
        console.log("🎯 Adding to manual questions collection...");
        
        // Extract sample input/output from question content
        let sampleInput = "Input will be provided";
        let sampleOutput = "Expected output";
        
        if (question.sampleTestCase) {
          sampleInput = question.sampleTestCase;
        }
        
        // Try to extract from HTML content with better parsing
        if (question.content) {
          // Clean the content first to make parsing easier
          const cleanContent = question.content
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ');

          // Look for Example patterns with Input/Output
          const examplePattern = /Example\s*\d*:\s*Input:\s*([^O]+?)Output:\s*([^E\n]+?)(?=Example|Explanation|Constraints|$)/gi;
          const exampleMatch = examplePattern.exec(cleanContent);
          
          if (exampleMatch) {
            sampleInput = exampleMatch[1].trim();
            sampleOutput = exampleMatch[2].trim();
          } else {
            // Fallback: Look for first Input: and Output: patterns
            const inputMatch = cleanContent.match(/Input:\s*([^O\n]+?)(?=Output|Explanation|$)/i);
            const outputMatch = cleanContent.match(/Output:\s*([^E\n]+?)(?=Explanation|Example|Constraints|$)/i);
            
            if (inputMatch) sampleInput = inputMatch[1].trim();
            if (outputMatch) sampleOutput = outputMatch[1].trim();
          }
          
          // Clean up the extracted values
          sampleInput = sampleInput.replace(/^\s*s\s*=\s*/, '').trim();
          sampleOutput = sampleOutput.replace(/^\s*(true|false)\s*/, '$1').trim();
        }

        // Clean description from HTML and remove examples section
        let description = question.content
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim();

        // Remove examples section since we extract them separately
        description = description.replace(/Example\s*\d*:[\s\S]*?(?=Constraints:|$)/gi, '').trim();
        
        // Remove constraints section to keep description clean
        description = description.replace(/Constraints:[\s\S]*$/gi, '').trim();

        // Prepare data in the same format as AddQuestion.tsx
        const questionData = {
          title: question.title,
          description: description || `${question.title}\n\nLeetCode problem #${question.frontendQuestionId}`,
          difficulty: question.difficulty,
          topic: question.topicTags[0]?.name || "Algorithms",
          sampleInput: sampleInput,
          sampleOutput: sampleOutput,
          solution: {
            language: selectedLanguage,
            code: code.trim(),
            explanation: notes.trim() || `Solution for ${question.title}`
          }
        };

        console.log("📋 Question data being sent:", {
          title: questionData.title,
          difficulty: questionData.difficulty,
          topic: questionData.topic,
          sampleInput: questionData.sampleInput,
          sampleOutput: questionData.sampleOutput,
          descriptionLength: questionData.description.length
        });

        // Use the same API call as AddQuestion.tsx
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(questionData),
        });

        if (!res.ok) {
          throw new Error("Failed to add to questions collection");
        }

        toast.success("🎉 Solution saved and added to your Questions collection!");
      } else {
        toast.success("Solution saved successfully!");
      }
      
      await fetchQuestionDetails();
    } catch (error) {
      console.error("Error saving solution:", error);
      toast.error("Failed to save solution");
    } finally {
      setSaving(false);
    }
  };

  const difficultyColors = {
    Easy: "text-green-400 bg-green-400/10",
    Medium: "text-yellow-400 bg-yellow-400/10",
    Hard: "text-red-400 bg-red-400/10",
  };

  if (loading) {
    return <p className="text-center text-gray-400">Loading question...</p>;
  }

  if (!question) {
    return <p className="text-center text-red-400">Question not found</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Link
            to="/leetcode-questions"
            className="cyber-button flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            {question.userSolution.isSolved ? (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            ) : (
              <Circle className="w-6 h-6 text-gray-500" />
            )}
            <h1 className="text-2xl font-bold">
              {question.frontendQuestionId}. {question.title}
            </h1>
          </div>
        </div>

        <a
          href={`https://leetcode.com/problems/${question.titleSlug}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="cyber-button flex items-center space-x-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open in LeetCode</span>
        </a>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="cyber-card"
        >
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <span className={`px-3 py-1 rounded-full ${difficultyColors[question.difficulty]}`}>
                {question.difficulty}
              </span>
              {question.topicTags.map((tag) => (
                <span
                  key={tag.slug}
                  className="bg-neon-blue/10 text-neon-blue px-2 py-1 rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: question.content }}
              className="text-gray-300 leading-relaxed"
            />
          </div>

          {question.sampleTestCase && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Test Case:</h4>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {question.sampleTestCase}
              </pre>
            </div>
          )}

          {question.hints && question.hints.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Hints:</h4>
              <ul className="space-y-2">
                {question.hints.map((hint, index) => (
                  <li key={index} className="text-sm text-gray-400">
                    {index + 1}. {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="cyber-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Solution</h3>
            
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isSolved}
                  onChange={(e) => setIsSolved(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-neon-purple focus:ring-neon-purple"
                />
                <span className="text-sm">Mark as solved</span>
              </label>
              
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="cyber-input text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <Editor
              height="400px"
              language={selectedLanguage}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes, approach, or explanation..."
              className="cyber-input w-full h-24 resize-none"
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={saveSolution}
              disabled={saving || !code.trim()}
              className="cyber-button w-full flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSolved && code.trim() ? "Save & Add to Collection" : "Save Solution"}</span>
                </>
              )}
            </button>

            <AIAnalysisButton
              questionId={question?._id || ''}
              code={code}
              language={selectedLanguage}
              onAnalysisComplete={(analysis) => {
                setAiAnalysis(analysis);
                setShowAiAnalysis(true);
              }}
              disabled={!code.trim()}
            />
          </div>

          {isSolved && code.trim() && (
            <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>This solution will be added to your Questions collection for easy access!</span>
              </p>
            </div>
          )}

          {question.userSolution.submissions.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Previous Submissions</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {question.userSolution.submissions
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((submission, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-800 rounded text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-neon-blue">{submission.lang}</span>
                        <span className="text-green-400">{submission.statusDisplay}</span>
                      </div>
                      <span className="text-gray-400">
                        {new Date(submission.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* AI Analysis Section */}
        {showAiAnalysis && aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AIAnalysis analysis={aiAnalysis} />
          </motion.div>
        )}
      </div>
    </div>
  );
}