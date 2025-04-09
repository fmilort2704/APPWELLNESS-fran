import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsAuthenticated(loggedIn);
  }, []);

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("institution"); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};