import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Code2, LayoutDashboard, UserCircle, Settings } from "lucide-react";
import axios from "axios";

export function Navbar({
  isAuthenticated,
  setIsAuthenticated,
}: {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
}) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="bg-cyber-darker border-b border-neon-purple/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Code2 className="w-8 h-8 text-neon-purple" />
            <span className="text-xl font-bold neon-text">DSA Tracker</span>
          </Link>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                    ${
                      isActive("/dashboard")
                        ? "bg-neon-purple/20 text-neon-purple"
                        : "text-gray-400 hover:text-neon-purple hover:bg-neon-purple/10"
                    }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                    ${
                      isActive("/profile")
                        ? "bg-neon-purple/20 text-neon-purple"
                        : "text-gray-400 hover:text-neon-purple hover:bg-neon-purple/10"
                    }`}
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 
                          hover:text-neon-purple hover:bg-neon-purple/10 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-neon-purple transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-400 hover:text-neon-purple transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
