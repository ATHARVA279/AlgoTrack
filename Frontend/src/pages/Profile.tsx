import { motion } from "framer-motion";
import {
  Trophy,
  Calendar,
  BookOpen,
  Download,
  Settings,
  User,
} from "../utils/icons";
import { useAuth } from "../utils/authContext";

function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const handleExportPDF = () => {};

  return (
    <div className="space-y-8" id="profile-content">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold neon-text">My Profile</h1>
        <button
          onClick={handleExportPDF}
          className="cyber-button flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export Progress</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="cyber-card col-span-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-neon-purple/20 flex items-center justify-center">
                <User className="w-8 h-8 text-neon-purple" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>
            <button className="cyber-button flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        <div className="cyber-card">
          <div className="flex items-center space-x-4 ">
            <Calendar className="w-8 h-8 text-neon-blue" />
            <div>
              <p className="text-gray-400">Member Since</p>
              <p className="text-xl font-semibold">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="cyber-card">
          <Trophy className="w-8 h-8 text-neon-purple mb-4" />
          <h3 className="text-lg font-semibold mb-2">Problems Solved</h3>
          <p className="text-3xl font-bold neon-text">
            {user.solvedQuestions?.length || 0} questions
          </p>
        </div>

        <div className="cyber-card">
          <BookOpen className="w-8 h-8 text-neon-purple mb-4" />
          <h3 className="text-lg font-semibold mb-2">Current Streak</h3>
          <p className="text-3xl font-bold neon-text">{user.streak} days</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="cyber-card"
      >
        <h3 className="text-xl font-bold mb-6">LeetCode Progress</h3>
        <div className="space-y-4">
          {user.leetcodeUsername ? (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">LeetCode Username</span>
                <span className="text-neon-purple">{user.leetcodeUsername}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">LeetCode Problems</span>
                <span className="text-neon-purple">{user.leetcodeSolvedQuestions?.length || 0} solved</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No LeetCode username linked</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;
