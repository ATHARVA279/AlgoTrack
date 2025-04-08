import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy,
  Clock,
  Calendar,
  BookOpen,
  Download,
  Settings,
  User
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Mock user data
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  joinedDate: '2024-01-15',
  stats: {
    totalSolved: 42,
    streak: 7,
    practiceTime: 150,
    topicsCompleted: {
      'Arrays': 15,
      'Strings': 8,
      'Linked Lists': 6,
      'Trees': 5,
      'Dynamic Programming': 4,
      'Graphs': 4
    }
  }
};

function Profile() {
  const handleExportPDF = () => {
    const element = document.getElementById('profile-content');
    const opt = {
      margin: 1,
      filename: 'dsa-progress.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-8" id="profile-content">
      {/* Header */}
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

      {/* Profile Info */}
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
          <div className="flex items-center space-x-4">
            <Calendar className="w-8 h-8 text-neon-blue" />
            <div>
              <p className="text-gray-400">Member Since</p>
              <p className="text-lg font-semibold">
                {new Date(userData.joinedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="cyber-card">
          <Trophy className="w-8 h-8 text-neon-purple mb-4" />
          <h3 className="text-lg font-semibold mb-2">Problems Solved</h3>
          <p className="text-3xl font-bold neon-text">{userData.stats.totalSolved}</p>
        </div>

        <div className="cyber-card">
          <Clock className="w-8 h-8 text-neon-blue mb-4" />
          <h3 className="text-lg font-semibold mb-2">Practice Time</h3>
          <p className="text-3xl font-bold neon-text">{userData.stats.practiceTime}h</p>
        </div>

        <div className="cyber-card">
          <BookOpen className="w-8 h-8 text-neon-purple mb-4" />
          <h3 className="text-lg font-semibold mb-2">Current Streak</h3>
          <p className="text-3xl font-bold neon-text">{userData.stats.streak} days</p>
        </div>
      </motion.div>

      {/* Topics Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="cyber-card"
      >
        <h3 className="text-xl font-bold mb-6">Topics Progress</h3>
        <div className="space-y-4">
          {Object.entries(userData.stats.topicsCompleted).map(([topic, count]) => (
            <div key={topic}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{topic}</span>
                <span className="text-neon-purple">{count} solved</span>
              </div>
              <div className="h-2 bg-cyber-darker rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
                  style={{ width: `${(count / userData.stats.totalSolved) * 100}%` }}
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