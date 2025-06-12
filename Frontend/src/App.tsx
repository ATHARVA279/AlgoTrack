import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "./utils/axiosInstance";

import { Navbar } from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import QuestionDetail from "./pages/QuestionDetail";
import AddQuestion from "./pages/AddQuestion";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading

  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      if (res.data.success) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // 🔄 Optionally show a loader
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-cyber-black">
        Checking Authentication...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-cyber-black">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Login onLogin={checkAuth} />
                )
              }
            />
            <Route
              path="/signup"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Signup onSignup={checkAuth} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/question/:id"
              element={
                isAuthenticated ? <QuestionDetail /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/add-question"
              element={
                isAuthenticated ? <AddQuestion /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#262626",
              color: "#fff",
              border: "1px solid rgba(176, 38, 255, 0.2)",
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
