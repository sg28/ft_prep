import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  graduationYear?: number;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
  graduationYear?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('julienites-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('julienites-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call - in a real app, this would be a fetch to your backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Mock validation - in a real app, validate against backend
      if (email && password) {
        const mockUser: User = {
          id: '1',
          name: 'Demo User',
          email: email,
          username: email.split('@')[0],
          graduationYear: 2020,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
        
        setUser(mockUser);
        localStorage.setItem('julienites-user', JSON.stringify(mockUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call - in a real app, this would be a fetch to your backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        username: userData.username,
        graduationYear: userData.graduationYear,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`
      };
      
      setUser(newUser);
      localStorage.setItem('julienites-user', JSON.stringify(newUser));
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
    localStorage.removeItem('julienites-user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};