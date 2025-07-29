import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

interface User {
  _id: string;
  username: string;
  email: string;
  streak: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  const fetchUser = async () => {
    try {
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
    }
  };

  const logout = async () => {
    await axios.post("/api/auth/logout");
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
