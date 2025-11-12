import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../utils/authContext";
import { ClipLoader } from "react-spinners";

const Signup = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "/api/auth/signup",
        { 
          username: name, 
          email, 
          password,
          leetcodeUsername: leetcodeUsername.trim() || undefined
        },
        { withCredentials: true }
      );

      if (res.status === 201) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        
        toast.success("Account created successfully!");
        fetchUser();
        navigate("/dashboard");
      } else {
        toast.error(res.data.message || "Signup failed!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.msg || err.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black px-4">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Create your Account
        </h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-purple"
              placeholder="Enter your name"
              required
            />
          </div>
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
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              LeetCode Username <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-purple"
              placeholder="Your LeetCode username"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add your LeetCode username to sync your solved problems automatically
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neon-purple text-white font-semibold py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <ClipLoader color="#ffffff" size={20} />
                <span>Creating account...</span>
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-neon-purple hover:text-purple-400 transition"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
