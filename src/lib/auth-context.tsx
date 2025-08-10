"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on app load
    const storedUser = localStorage.getItem('ansluta_user');
    const storedToken = localStorage.getItem('ansluta_token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('ansluta_user');
        localStorage.removeItem('ansluta_token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // Store user data and a simple token (in production, use proper JWT)
    localStorage.setItem('ansluta_user', JSON.stringify(userData));
    localStorage.setItem('ansluta_token', `token_${userData.id}_${Date.now()}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ansluta_user');
    localStorage.removeItem('ansluta_token');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}