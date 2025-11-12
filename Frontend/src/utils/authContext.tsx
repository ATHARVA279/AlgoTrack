import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const fetchingRef = useRef(false);
  const isAuthenticated = !!user;

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      setIsLoading(true);
      
      // Add timeout to prevent blocking the app if backend is slow
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const res = await axios.get("/api/auth/me", { 
        withCredentials: true,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (res.data.success) {
        setUser(res.data.user);
        sessionStorage.setItem("streak", res.data.user.streak);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
      fetchingRef.current = false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("streak");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized) {
      fetchUser();
    }
  }, [fetchUser, hasInitialized]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, fetchUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
