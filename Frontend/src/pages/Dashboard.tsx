import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Filter,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useEffect } from "react";

const mockData = {
  stats: {
    totalSolved: 42,
    streak: 7,
    practiceTime: 150,
  },
  progressData: [
    { day: "Mon", questions: 4 },
    { day: "Tue", questions: 3 },
    { day: "Wed", questions: 5 },
    { day: "Thu", questions: 2 },
    { day: "Fri", questions: 6 },
    { day: "Sat", questions: 4 },
    { day: "Sun", questions: 3 },
  ],
  questions: [
    {
      id: "1",
      title: "Two Sum",
      topic: "Arrays",
      difficulty: "Easy",
      status: "Solved",
    },
    {
      id: "2",
      title: "Valid Parentheses",
      topic: "Stack",
      difficulty: "Medium",
      status: "In Progress",
    },
    {
      id: "3",
      title: "Merge K Sorted Lists",
      topic: "Linked Lists",
      difficulty: "Hard",
      status: "Not Started",
    },
  ],
};

const difficultyColors = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-red-400",
};

const statusColors = {
  Solved: "bg-green-500/20 text-green-400",
  "In Progress": "bg-yellow-500/20 text-yellow-400",
  "Not Started": "bg-gray-500/20 text-gray-400",
};

function Dashboard() {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/questions", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  console.log("Questions:", questions);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="cyber-card flex items-center">
          <CheckCircle2 className="w-12 h-12 text-neon-purple mr-4" />
          <div>
            <p className="text-gray-400">Total Solved</p>
            <h3 className="text-3xl font-bold neon-text">
              {mockData.stats.totalSolved}
            </h3>
          </div>
        </div>

        <div className="cyber-card flex items-center">
          <Flame className="w-12 h-12 text-neon-blue mr-4" />
          <div>
            <p className="text-gray-400">Current Streak</p>
            <h3 className="text-3xl font-bold neon-text">
              {mockData.stats.streak} days
            </h3>
          </div>
        </div>

        <div className="cyber-card flex items-center">
          <Clock className="w-12 h-12 text-neon-purple mr-4" />
          <div>
            <p className="text-gray-400">Practice Time</p>
            <h3 className="text-3xl font-bold neon-text">
              {mockData.stats.practiceTime}h
            </h3>
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
          <h2 className="text-xl font-bold">Weekly Progress</h2>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-neon-purple" />
            <span className="text-gray-400">Last 7 days</span>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData.progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  background: "#1A1A1A",
                  border: "1px solid rgba(176, 38, 255, 0.2)",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="questions"
                stroke="#B026FF"
                strokeWidth={2}
                dot={{ fill: "#B026FF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="cyber-card bg-gradient-to-r from-neon-purple/10 to-neon-blue/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BookOpen className="w-8 h-8 text-neon-purple" />
            <div>
              <h3 className="text-lg font-bold">Daily Practice Reminder</h3>
              <p className="text-gray-400">
                Keep your streak going! Practice DSA today.
              </p>
            </div>
          </div>
          <button className="cyber-button">Mark as Done</button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="cyber-card"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <h2 className="text-xl font-bold">Practice Questions</h2>

          <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cyber-input pl-10"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="cyber-input pl-10 appearance-none pr-8"
                >
                  <option value="All">All Topics</option>
                  <option value="Arrays">Arrays</option>
                  <option value="Stack">Stack</option>
                  <option value="LinkedList">Linked List</option>
                </select>
              </div>

              <Link
                to="/add-question"
                className="cyber-button flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Question</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question) => (
            <Link
              key={question._id}
              to={`/question/${question._id}`}
              className="block cyber-card hover:border-neon-purple/40 transition-colors p-4"
            >
              <div className="flex items-center justify-between">
                {/* Left Side */}
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {question.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <span className="bg-neon-purple/10 text-neon-purple px-3 py-1 rounded-full">
                      {question.topic}
                    </span>
                    <span
                      className={`${difficultyColors[question.difficulty]}`}
                    >
                      {question.difficulty}
                    </span>
                  </div>
                </div>

                {/* Right Side */}
                <div className="text-xs text-right text-gray-400">
                  <p>Added on</p>
                  <p className="font-medium text-sm">
                    {new Date(question.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
