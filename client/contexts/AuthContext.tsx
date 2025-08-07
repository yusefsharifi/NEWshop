import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user session on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll use hardcoded credentials
      // In production, this should make an API call to your backend
      
      const demoUsers = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@aquapro.com',
          role: 'admin' as const,
          password: 'admin123',
          isActive: true
        },
        {
          id: 2,
          username: 'user',
          email: 'user@aquapro.com',
          role: 'user' as const,
          password: 'user123',
          isActive: true
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const foundUser = demoUsers.find(
        u => u.username === username && u.password === password
      );

      if (foundUser) {
        const userWithoutPassword = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.role,
          isActive: foundUser.isActive
        };

        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('authToken', 'demo-token-' + Date.now());
        
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In production, this should make an API call to your backend
      // For now, we'll simulate successful registration

      // Check if username or email already exists (simulation)
      const existingUsers = ['admin', 'user', 'test'];
      if (existingUsers.includes(userData.username.toLowerCase())) {
        setIsLoading(false);
        return false;
      }

      // Generate new user ID
      const newUserId = Math.floor(Math.random() * 10000) + 100;

      const newUser: User = {
        id: newUserId,
        username: userData.username,
        email: userData.email,
        role: 'user',
        isActive: true
      };

      // In production, you would save to backend
      // For demo, we'll just return success without logging in
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      isAdmin,
      isAuthenticated
    }}>
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
