import { motion } from "framer-motion";
import {
  Trophy,
  Calendar,
  BookOpen,
  Download,
  Settings,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";

function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          credentials: "include",
        });
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
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
                <h2 className="text-2xl font-bold">{userData.name}</h2>
                <p className="text-gray-400">{userData.email}</p>
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
                {new Date(userData.joinedDate).toLocaleDateString("en-IN", {
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
            {userData.totalSolved} questions
          </p>
        </div>

        <div className="cyber-card">
          <BookOpen className="w-8 h-8 text-neon-purple mb-4" />
          <h3 className="text-lg font-semibold mb-2">Current Streak</h3>
          <p className="text-3xl font-bold neon-text">{userData.streak} days</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="cyber-card"
      >
        <h3 className="text-xl font-bold mb-6">Topics Progress</h3>
        <div className="space-y-4">
          {Object.entries(userData.topicsCompleted).map(([topic, count]) => (
            <div key={topic}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{topic}</span>
                <span className="text-neon-purple">{count} solved</span>
              </div>
              <div className="h-2 bg-cyber-darker rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
                  style={{
                    width: `${(count / userData.totalSolved) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;
