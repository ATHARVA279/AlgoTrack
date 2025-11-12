import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../utils/authContext";

const Login = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        
        toast.success("Logged in successfully!");
        fetchUser();
        navigate("/dashboard");
      } else {
        toast.error("Login failed!");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.msg ||
        err.message ||
        "An unexpected error occurred!";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black px-4">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Login to Continue
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-purple"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-purple"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neon-purple text-white font-semibold py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-neon-purple hover:text-purple-400 transition"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
