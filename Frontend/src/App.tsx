import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { Navbar } from "./components/Navbar";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useAuth } from "./utils/authContext";

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
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowApp(true);
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !showApp) {
    return (
      <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" text="Connecting to server..." />
        <p className="text-gray-500 text-sm mt-4">This may take a moment if the server is waking up</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-cyber-black">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid rgba(176, 38, 255, 0.3)',
            },
            success: {
              iconTheme: {
                primary: '#B026FF',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
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
