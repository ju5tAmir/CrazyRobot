import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/services/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userName: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  userName: "Guest",
  login: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    auth.isAuthenticated(),
  );
  const [isAdmin, setIsAdmin] = useState(auth.isAdmin());
  const [userName, setUserName] = useState(auth.getUserName());

  useEffect(() => {
    // Update state when component mounts
    const checkAuth = () => {
      setIsAuthenticated(auth.isAuthenticated());
      setIsAdmin(auth.isAdmin());
      setUserName(auth.getUserName());
    };

    checkAuth();

    // Set up event listener for storage changes (for multi-tab support)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (username: string, password: string): boolean => {
    const success = auth.login(username, password);
    if (success) {
      setIsAuthenticated(true);
      setIsAdmin(auth.isAdmin());
      setUserName(auth.getUserName());
    }
    return success;
  };

  const logout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserName("Guest");
  };

  const value = {
    isAuthenticated,
    isAdmin,
    userName,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
