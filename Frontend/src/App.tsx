import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useAuth } from "./utils/authContext";

// Lazy load pages to reduce initial bundle size
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const QuestionDetail = lazy(() => import("./pages/QuestionDetail"));
const AddQuestion = lazy(() => import("./pages/AddQuestion"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Questions = lazy(() => import("./pages/Questions"));
const LeetCodeQuestions = lazy(() => import("./pages/LeetCodeQuestions"));
const LeetCodeQuestionDetail = lazy(() => import("./pages/LeetCodeQuestionDetail"));

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-cyber-black">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>
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
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
