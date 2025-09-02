import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";

interface User {
  _id: string;
  username: string;
  email: string;
  leetcodeUsername?: string;
  streak: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/auth/me", { withCredentials: true });
      if (res.data.success) {
        setUser(res.data.user);
        console.log("User fetched:", res.data.user);
        sessionStorage.setItem('streak', res.data.user.streak);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear local storage token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("streak");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
