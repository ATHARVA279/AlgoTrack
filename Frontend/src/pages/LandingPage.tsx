import React from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Brain, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto px-4"
      >
        <div className="flex justify-center mb-6">
          <Code2 className="w-16 h-16 text-neon-purple" />
        </div>

        <h1 className="text-5xl font-bold mb-6 neon-text">
          Master Your DSA Journey
        </h1>

        <p className="text-xl text-gray-400 mb-8">
          Track your daily DSA practice and improve your problem-solving skills
          with our comprehensive tracking system.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="cyber-button px-6 py-2"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="cyber-button px-6 py-2"
          >
            Sign Up
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto px-4"
      >
        <div className="cyber-card">
          <Brain className="w-8 h-8 text-neon-purple mb-4" />
          <h3 className="text-xl font-bold mb-2">Track Progress</h3>
          <p className="text-gray-400">
            Monitor your daily practice and visualize your improvement over
            time.
          </p>
        </div>

        <div className="cyber-card">
          <Zap className="w-8 h-8 text-neon-blue mb-4" />
          <h3 className="text-xl font-bold mb-2">Stay Motivated</h3>
          <p className="text-gray-400">
            Build streaks and maintain consistency with daily reminders.
          </p>
        </div>

        <div className="cyber-card">
          <Trophy className="w-8 h-8 text-neon-purple mb-4" />
          <h3 className="text-xl font-bold mb-2">Master Topics</h3>
          <p className="text-gray-400">
            Organize your learning by topics and track mastery in each area.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LandingPage;
