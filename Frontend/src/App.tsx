import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Navbar } from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import QuestionDetail from "./pages/QuestionDetail";
import AddQuestion from "./pages/AddQuestion";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import { useAuth } from "./utils/authContext";
import Questions from "./pages/Questions";
import LeetCodeQuestions from "./pages/LeetCodeQuestions";
import LeetCodeQuestionDetail from "./pages/LeetCodeQuestionDetail";

function App() {
  const { isAuthenticated, isLoading, fetchUser } = useAuth();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-cyber-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-purple mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
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
                isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
              }
            />
            <Route
              path="/signup"
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />
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

            <Route
              path="/questions"
              element={isAuthenticated ? <Questions /> : <Navigate to="/login" />}
            />
            <Route
              path="/leetcode-questions"
              element={isAuthenticated ? <LeetCodeQuestions /> : <Navigate to="/login" />}
            />
            <Route
              path="/leetcode-question/:id"
              element={isAuthenticated ? <LeetCodeQuestionDetail /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
