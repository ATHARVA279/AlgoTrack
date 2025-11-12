import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Circle,
  ExternalLink,
} from "../utils/icons";
import { Link } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useAuth } from "../utils/authContext";
import { ClipLoader } from "react-spinners";

interface LeetCodeQuestion {
  _id: string;
  questionId: string;
  frontendQuestionId: string;
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topicTags: { name: string; slug: string }[];
  categoryTitle: string;
  isSolved: boolean;
  lastSolvedAt?: string;
  submissionCount: number;
  notes: string;
}

export default function LeetCodeQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<LeetCodeQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<
    LeetCodeQuestion[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showSolvedOnly, setShowSolvedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [leetcodeProfile, setLeetcodeProfile] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    lastSyncAt: null,
    ranking: null,
  });



  const fetchLeetCodeQuestions = useCallback(async () => {
    try {
      console.log("🔄 Fetching user's solved LeetCode questions...");
      setLoading(true);
      const response = await axios.get("/api/leetcode/questions");
      console.log("✅ LeetCode questions response:", response.data);

      if (response.data.questions !== undefined) {
        console.log(
          "📊 Number of questions received:",
          response.data.questions.length
        );
        setQuestions(response.data.questions);
        setLeetcodeProfile(response.data.profile);

        // Show message if no questions are synced yet
        if (response.data.questions.length === 0 && response.data.message) {
          toast(response.data.message);
        }
      } else {
        // Fallback for old API format
        console.log("📊 Number of questions received:", response.data.length);
        setQuestions(response.data);
      }


    } catch (error) {
      console.error("❌ Error fetching LeetCode questions:", error);
      toast.error("Failed to fetch LeetCode questions");
    } finally {
      setLoading(false);
    }
  }, []);

  const filterQuestions = useCallback(() => {
    console.log("🔍 Filtering questions...");
    console.log("📝 Total questions:", questions.length);
    console.log("🔎 Search query:", searchQuery);
    console.log("📊 Selected difficulty:", selectedDifficulty);
    console.log("✅ Show solved only:", showSolvedOnly);

    let filtered = questions;

    if (searchQuery) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.topicTags.some((tag) =>
            tag.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedDifficulty !== "All") {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
    }

    if (showSolvedOnly) {
      filtered = filtered.filter((q) => q.isSolved);
    }

    console.log("📋 Filtered questions count:", filtered.length);
    setFilteredQuestions(filtered);
  }, [searchQuery, selectedDifficulty, showSolvedOnly, questions]);

  useEffect(() => {
    console.log("👤 Frontend: Current user:", user);
    console.log("🔗 Frontend: User LeetCode username:", user?.leetcodeUsername);
    fetchLeetCodeQuestions();
    if (user?.leetcodeUsername) {
      setLeetcodeUsername(user.leetcodeUsername);
    }
  }, [fetchLeetCodeQuestions, user]);

  useEffect(() => {
    filterQuestions();
  }, [filterQuestions]);

  const syncLeetCodeData = async (syncAll = false) => {
    const usernameToSync = leetcodeUsername.trim() || user?.leetcodeUsername;

    if (!usernameToSync) {
      toast.error("Please enter your LeetCode username");
      return;
    }

    try {
      setSyncing(true);
      const syncType = syncAll ? "comprehensive" : "quick";
      const endpoint = syncAll
        ? "/api/leetcode/sync-all"
        : "/api/leetcode/sync";

      console.log(`🔄 Starting ${syncType} LeetCode sync for:`, usernameToSync);

      // Increase timeout for comprehensive sync
      const timeout = syncAll ? 300000 : 60000; // 5 minutes for full sync, 1 minute for quick

      const response = await axios.post(
        endpoint,
        {
          leetcodeUsername: usernameToSync,
        },
        {
          timeout,
          withCredentials: true,
        }
      );

      console.log("✅ Sync completed:", response.data);
      toast.success(response.data.message);
      setShowSyncModal(false);
      await fetchLeetCodeQuestions();
    } catch (error: unknown) {
      console.error("❌ Error syncing LeetCode data:", error);

      let errorMessage = "Failed to sync LeetCode data";
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "ECONNABORTED") {
          errorMessage =
            "Sync is taking longer than expected. This is normal for comprehensive sync. Please try again.";
        } else if (
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
        ) {
          const responseData = error.response.data as unknown;
          errorMessage = responseData?.message || errorMessage;
        }
      }

      toast.error(errorMessage);
    } finally {
      setSyncing(false);
    }
  };



  const difficultyColors = {
    Easy: "text-green-400 bg-green-400/10",
    Medium: "text-yellow-400 bg-yellow-400/10",
    Hard: "text-red-400 bg-red-400/10",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="cyber-card animate-pulse">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <div>
              <div className="h-8 bg-gray-700 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-48"></div>
            </div>
            <div className="h-10 bg-gray-700 rounded w-32"></div>
          </div>

          {/* Loading Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="h-10 bg-gray-700 rounded flex-1"></div>
            <div className="h-10 bg-gray-700 rounded w-40"></div>
            <div className="h-6 bg-gray-700 rounded w-24"></div>
          </div>
        </div>

        {/* Loading Questions */}
        <div className="space-y-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="cyber-card animate-pulse p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-6 bg-gray-700 rounded w-80"></div>
                      <div className="w-4 h-4 bg-gray-700 rounded"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-6 bg-gray-700 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-700 rounded-full w-20"></div>
                      <div className="h-6 bg-gray-700 rounded-full w-24"></div>
                    </div>
                  </div>
                </div>
                <div className="h-8 bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <ClipLoader color="#B026FF" size={20} />
            <span>Loading LeetCode questions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Sync LeetCode Data</h3>
            <p className="text-gray-400 mb-4">
              {user?.leetcodeUsername
                ? `Sync data for: ${user.leetcodeUsername}`
                : "Enter your LeetCode username to sync your solved problems:"}
            </p>
            <input
              type="text"
              placeholder="LeetCode username"
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              className="cyber-input w-full mb-4"
              disabled={syncing}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => syncLeetCodeData(false)}
                disabled={syncing}
                className="cyber-button flex-1 flex items-center justify-center space-x-2"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <span>Quick Sync</span>
                )}
              </button>
              <button
                onClick={() => syncLeetCodeData(true)}
                disabled={syncing}
                className="cyber-button flex-1 flex items-center justify-center space-x-2 bg-neon-purple/20 border-neon-purple"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing All...</span>
                  </>
                ) : (
                  <span>Sync ALL Data</span>
                )}
              </button>
              <button
                onClick={() => setShowSyncModal(false)}
                disabled={syncing}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold">LeetCode Questions</h2>
            <p className="text-gray-400">
              {questions.length} synced questions • Total solved:{" "}
              {leetcodeProfile.totalSolved} • Easy: {leetcodeProfile.easySolved}{" "}
              • Medium: {leetcodeProfile.mediumSolved} • Hard:{" "}
              {leetcodeProfile.hardSolved}
              {leetcodeProfile.lastSyncAt && (
                <span>
                  {" "}
                  • Last sync:{" "}
                  {new Date(leetcodeProfile.lastSyncAt).toLocaleDateString()}
                </span>
              )}
            </p>

          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowSyncModal(true)}
              className="cyber-button flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Sync LeetCode</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cyber-input pl-10 w-full"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="cyber-input pl-10 appearance-none pr-8"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <label className="flex items-center space-x-2 text-gray-300">
            <input
              type="checkbox"
              checked={showSolvedOnly}
              onChange={(e) => setShowSolvedOnly(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-neon-purple focus:ring-neon-purple"
            />
            <span>Solved only</span>
          </label>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredQuestions.map((question) => (
          <div
            key={question._id}
            className="cyber-card hover:border-neon-purple/40 transition-colors p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                  {question.isSolved ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {question.frontendQuestionId}. {question.title}
                    </h3>
                    <a
                      href={`https://leetcode.com/problems/${question.titleSlug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-neon-purple transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        difficultyColors[question.difficulty]
                      }`}
                    >
                      {question.difficulty}
                    </span>

                    {question.topicTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.slug}
                        className="bg-neon-blue/10 text-neon-blue px-2 py-1 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}

                    {question.topicTags.length > 3 && (
                      <span className="text-gray-400">
                        +{question.topicTags.length - 3} more
                      </span>
                    )}
                  </div>

                  {question.isSolved && (
                    <div className="mt-2 text-sm text-gray-400">
                      <span>
                        Solved • {question.submissionCount} submission(s)
                      </span>
                      {question.lastSolvedAt && (
                        <span>
                          {" "}
                          •{" "}
                          {new Date(question.lastSolvedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0">
                <Link
                  to={question._id ? `/leetcode-question/${question._id}` : '#'}
                  onClick={(e) => { if (!question._id) { e.preventDefault(); } }}
                  className="cyber-button"
                >
                  {question.isSolved ? "View Solution" : "Solve"}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              {questions.length === 0
                ? "No LeetCode questions synced yet!"
                : "No questions match your filters."}
            </p>
            {questions.length === 0 && (
              <div className="space-y-4">
                <p className="text-gray-500">
                  Your LeetCode profile shows {leetcodeProfile.totalSolved}{" "}
                  solved problems.
                  <br />
                  Use "Sync LeetCode" to import recent ones, or go to "Questions" → "Add Question" for older ones!
                </p>
                <button
                  onClick={() => setShowSyncModal(true)}
                  className="cyber-button bg-neon-purple/20 border-neon-purple"
                >
                  🚀 Sync Recent Questions
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
