import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiRequest from '../api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          
          const profile = await apiRequest('/auth/profile');
          setUser(profile);
        } catch (error) {
          console.error('Session restore failed:', error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  
  useEffect(() => {
    if (user?.preferences?.theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [user]);


  const login = useCallback(async (email, password) => {
    try {
      const response = await apiRequest('/auth/login', 'POST', { email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      showToast('Logged in successfully!', 'success');
      return response.user;
    } catch (error) {
      showToast(error.message || 'Login failed.', 'error');
      throw error;
    }
  }, [showToast]);

  const register = useCallback(async (name, email, mobile, password) => {
    try {
      const response = await apiRequest('/auth/register', 'POST', { name, email, mobile, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      showToast('Account registered successfully!', 'success');
      return response.user;
    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
      throw error;
    }
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showToast('Logged out successfully.', 'info');
  }, [showToast]);

  const updateProfile = useCallback(async (updates) => {
    try {
      const updatedUser = await apiRequest('/auth/profile', 'PUT', updates);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      showToast('Profile updated successfully!', 'success');
      return updatedUser;
    } catch (error) {
      showToast(error.message || 'Failed to update profile.', 'error');
      throw error;
    }
  }, [showToast]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await apiRequest('/auth/change-password', 'PUT', { currentPassword, newPassword });
      showToast(response.message || 'Password changed successfully!', 'success');
      return response;
    } catch (error) {
      showToast(error.message || 'Password change failed.', 'error');
      throw error;
    }
  }, [showToast]);

  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await apiRequest('/auth/forgot-password', 'POST', { email });
      showToast(response.message, 'success');
      return response; 
    } catch (error) {
      showToast(error.message || 'Failed to request reset PIN.', 'error');
      throw error;
    }
  }, [showToast]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
