/**
 * HealthWallet Nigeria - Authentication Context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { authApi } from '@/services/api';
import { initializeDemoDb } from '@/services/localStorage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    role: 'PATIENT' | 'HOSPITAL';
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize demo database
  useEffect(() => {
    initializeDemoDb();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      if (authApi.isAuthenticated()) {
        const currentUser = await authApi.me();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authApi.login(email, password);
    setUser(response.user);
    return response.user;
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    role: 'PATIENT' | 'HOSPITAL';
  }): Promise<User> => {
    const response = await authApi.register(data);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
