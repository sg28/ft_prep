import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, userApi } from '../services/api';
import { useToast } from './ToastContext';

// User interface matching backend response
interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  graduation_year?: number;
  bio?: string;
  location?: string;
  current_role?: string;
  profile_image_url?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_handle?: string;
  following_count?: number;
  followers_count?: number;
  post_count?: number;
  is_active?: boolean;
  is_verified?: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

// Frontend User interface (camelCase for React components)
interface FrontendUser {
  id: string;
  name: string;
  email: string;
  username: string;
  graduationYear?: number;
  bio?: string;
  location?: string;
  currentRole?: string;
  profileImage?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  followingCount?: number;
  followersCount?: number;
  postCount?: number;
  isActive?: boolean;
  isVerified?: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  // Additional properties for mock data in UserProfile
  skills?: string[];
  education?: Array<{
    id: number;
    institution: string;
    degree: string;
    field: string;
    year: number;
  }>;
  experience?: Array<{
    id: number;
    company: string;
    position: string;
    duration: string;
    description?: string;
  }>;
}

interface AuthContextType {
  user: FrontendUser | null;
  token: string | null;
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

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error?.detail) {
    if (Array.isArray(error.detail)) {
      // Pydantic validation errors
      return error.detail.map((err: any) => err.msg).join(', ');
    } else if (typeof error.detail === 'string') {
      return error.detail;
    }
  }
  
  if (error?.message) return error.message;
  
  return 'An unknown error occurred';
};

// Convert backend snake_case to frontend camelCase
const convertToFrontendUser = (backendUser: User): FrontendUser => {
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    username: backendUser.username,
    graduationYear: backendUser.graduation_year,
    bio: backendUser.bio,
    location: backendUser.location,
    currentRole: backendUser.current_role,
    profileImage: backendUser.profile_image_url ? `http://localhost:8000${backendUser.profile_image_url}` : undefined,
    phone: backendUser.phone,
    linkedin: backendUser.linkedin_url,
    github: backendUser.github_url,
    twitter: backendUser.twitter_handle,
    followingCount: backendUser.following_count,
    followersCount: backendUser.followers_count,
    postCount: backendUser.post_count,
    isActive: backendUser.is_active,
    isVerified: backendUser.is_verified,
    role: backendUser.role,
    createdAt: backendUser.created_at,
    updatedAt: backendUser.updated_at,
    lastLoginAt: backendUser.last_login_at,
    // Initialize empty arrays for mock data properties
    skills: [],
    education: [],
    experience: [],
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FrontendUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: showError, loading: showLoading, dismiss } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('julienites-user');
    const storedToken = localStorage.getItem('julienites-token');

    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        // Clear stale temp-id sessions
        if (parsed.id === 'temp-id') {
          localStorage.removeItem('julienites-user');
          localStorage.removeItem('julienites-token');
          localStorage.removeItem('julienites-refresh-token');
        } else {
          setUser(parsed);
          setToken(storedToken);
        }
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('julienites-user');
        localStorage.removeItem('julienites-token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const loadingId = showLoading('Signing in...');
    setIsLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      
      if (response.data && response.data.access_token) {
        const { access_token, refresh_token } = response.data;

        // Store tokens
        localStorage.setItem('julienites-token', access_token);
        localStorage.setItem('julienites-refresh-token', refresh_token);

        // Fetch current user data to get real user ID
        const userResponse = await userApi.getCurrentUser(access_token);

        if (userResponse.data) {
          const frontendUser = convertToFrontendUser(userResponse.data);
          setUser(frontendUser);
          setToken(access_token);
          localStorage.setItem('julienites-user', JSON.stringify(frontendUser));
          dismiss(loadingId);
          success('Successfully signed in!');
          setIsLoading(false);
          return true;
        } else {
          console.error('Failed to fetch user data:', userResponse.error);
          dismiss(loadingId);
          showError('Login succeeded but failed to load user profile. Please try again.');
          localStorage.removeItem('julienites-token');
          localStorage.removeItem('julienites-refresh-token');
          setIsLoading(false);
          return false;
        }
      } else {
        dismiss(loadingId);
        showError(extractErrorMessage(response.error) || 'Login failed');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      dismiss(loadingId);
      showError('An error occurred during login');
      console.error('Login error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    const loadingId = showLoading('Creating your account...');
    setIsLoading(true);
    
    try {
      const response = await authApi.register(userData);
      
      if (response.data) {
        // Convert backend user to frontend format
        const frontendUser = convertToFrontendUser(response.data);
        
        // Store user data
        setUser(frontendUser);
        localStorage.setItem('julienites-user', JSON.stringify(frontendUser));
        
        dismiss(loadingId);
        success('Account created successfully! Welcome to Julienites!');
        setIsLoading(false);
        return true;
      } else {
        dismiss(loadingId);
        showError(extractErrorMessage(response.error) || 'Registration failed');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      dismiss(loadingId);
      showError('An error occurred during registration');
      console.error('Registration error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('julienites-user');
    localStorage.removeItem('julienites-token');
    localStorage.removeItem('julienites-refresh-token');
    success('Successfully logged out');
  };

  const value = {
    user,
    token,
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