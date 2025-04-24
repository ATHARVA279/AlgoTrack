import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";

import { Navbar } from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import QuestionDetail from "./pages/QuestionDetail";
import AddQuestion from "./pages/AddQuestion";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        if (res.data.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-cyber-black">
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route
              path="/signup"
              element={<Signup setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/question/:id" element={<QuestionDetail />} />
            <Route path="/add-question" element={<AddQuestion />} />
            <Route path="/profile" element={<Profile />} />
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
