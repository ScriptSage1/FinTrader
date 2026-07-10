import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user session exists in local storage on load
    const storedUser = localStorage.getItem('fintrader_user_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(username, password);
      setUser(data);
      setIsAuthenticated(true);
      localStorage.setItem('fintrader_user_session', JSON.stringify(data));
      return true;
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password, name) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.register(username, password, name);
      setUser(data);
      setIsAuthenticated(true);
      localStorage.setItem('fintrader_user_session', JSON.stringify(data));
      return true;
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('fintrader_user_session');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
