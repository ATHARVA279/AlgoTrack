import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Code2, MessageCircle, ArrowLeft } from "../utils/icons";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { CodeHighlighter } from "../components/CodeHighlighter";
import { AIAnalysis } from "../components/AIAnalysis";
import { AIAnalysisButton } from "../components/AIAnalysisButton";
import { AIAnalysisError } from "../components/AIAnalysisError";

// Custom markdown components
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
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside my-2 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside my-2 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="text-gray-300 ml-4" {...props}>
      {children}
    </li>
  ),
};

const difficultyColors = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-red-400",
};

function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`https://algotrack-vujc.onrender.com/api/questions/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setQuestion(data);
      } catch (err) {
        console.error("Error fetching question:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!question)
    return <p className="text-center text-red-500">Question not found.</p>;

  return (
    <div className="space-y-8">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card"
      >
        <h1 className="text-3xl font-bold mb-6">{question.title}</h1>

        <div className="prose prose-invert max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {question.description}
          </ReactMarkdown>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span className="text-neon-blue mr-2">📥</span>
              Sample Input
            </h3>
            <div className="bg-cyber-darker rounded-lg p-4 border border-gray-700">
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                {question.sampleInput}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span className="text-green-400 mr-2">📤</span>
              Sample Output
            </h3>
            <div className="bg-cyber-darker rounded-lg p-4 border border-gray-700">
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                {question.sampleOutput}
              </pre>
            </div>
          </div>
        </div>
      </motion.div>

      {question.solution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="cyber-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Solution</h2>
            <button className="cyber-button flex items-center space-x-2">
              <Code2 className="w-5 h-5" />
              <span>Edit Solution</span>
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full bg-neon-blue/10 text-neon-blue text-sm">
                {question.solution.language}
              </span>
              <span className="text-gray-400">
                {new Date(question.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="cyber-card bg-cyber-darker overflow-hidden">
              <CodeHighlighter
                code={question.solution.code}
                language={question.solution.language}
              />
            </div>

            <div className="cyber-card bg-gradient-to-r from-neon-purple/5 to-neon-blue/5 border border-neon-purple/20">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="w-5 h-5 text-neon-purple" />
                <h3 className="text-lg font-semibold">Explanation</h3>
              </div>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {question.solution.explanation}
                </ReactMarkdown>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Code Analysis</h3>
              <AIAnalysisButton
                question={question}
                onAnalysisComplete={(analysis) => {
                  setAiAnalysis(analysis);
                  setShowAiAnalysis(true);
                  setAnalysisError(false);
                }}
                onAnalysisError={() => {
                  setShowAiAnalysis(false);
                  setAiAnalysis(null);
                  setAnalysisError(true);
                }}
              />
            </div>

            {showAiAnalysis && aiAnalysis && !analysisError && (
              <AIAnalysis analysis={aiAnalysis} />
            )}

            {analysisError && (
              <AIAnalysisError 
                onRetry={() => {
                  setAnalysisError(false);
                  // Trigger the analyze button programmatically by simulating a click
                  const analyzeButton = document.querySelector('[data-ai-analyze-button]');
                  if (analyzeButton) {
                    (analyzeButton as HTMLButtonElement).click();
                  }
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default QuestionDetail;
