import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Flame,
  CheckCircle2,
  BookOpen,
  Filter,
  Search,
} from "../utils/icons";
import { motion } from "framer-motion";

import { useEffect } from "react";

import ProgressChart from "../components/ProgressChart";

const difficultyColors = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-red-400",
};

function Dashboard() {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const streak = sessionStorage.getItem("streak");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const apiUrl = `https://algotrack-vujc.onrender.com/api/questions`;
        const res = await fetch(apiUrl, {
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

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="cyber-card flex items-center">
          <CheckCircle2 className="w-12 h-12 text-neon-purple mr-4" />
          <div>
            <p className="text-gray-400">Total Solved</p>
            <h3 className="text-3xl font-bold neon-text">
              {questions.length} questions
            </h3>
          </div>
        </div>

        <div className="cyber-card flex items-center">
          <Flame className="w-12 h-12 text-neon-blue mr-4" />
          <div>
            <p className="text-gray-400">Current Streak</p>
            <h3 className="text-3xl font-bold neon-text">{streak} days</h3>
          </div>
        </div>

        <div className="flex items-center justify-between col-span-1 md:col-span-2 cyber-card bg-gradient-to-r from-neon-purple/10 to-neon-blue/10">
          <div className="flex items-center space-x-4">
            <BookOpen className="w-8 h-8 text-neon-purple" />
            <div>
              <h3 className="text-lg font-bold">Daily Practice Reminder</h3>
              <p className="text-gray-400">
                Keep your streak going! Practice DSA today.
              </p>
            </div>
          </div>
          <Link
            to="/add-question"
            className="cyber-button flex items-center space-x-2"
          >
            <span>Mark As Done</span>
          </Link>
        </div>
      </motion.div>

      <ProgressChart />

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
          {questions.map((entry) => (
            <Link
              key={entry._id}
              to={`/question/${entry.question._id}`}
              className="block cyber-card hover:border-neon-purple/40 transition-colors p-4"
            >
              <div className="flex items-center justify-between">
                {/* Left Side */}
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {entry.question.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-l text-gray-400">
                    <span className="bg-neon-purple/10 text-neon-purple px-3 py-1 rounded-full">
                      {entry.question.topic}
                    </span>
                    <span
                      className={`${
                        difficultyColors[entry.question.difficulty]
                      }`}
                    >
                      {entry.question.difficulty}
                    </span>
                  </div>
                </div>

                <div className="text-l text-right text-gray-400">
                  <p>Added on</p>
                  <p className="font-medium text-sm">
                    {new Date(entry.question.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
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
