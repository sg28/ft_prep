const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    const data = await response.json().catch(() => ({}));
    
    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.message || 'An error occurred',
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

export const userApi = {
  getProfile: (userId: string) => 
    apiRequest(`/users/${userId}`),
    
  updateProfile: (userId: string, profileData: any) =>
    apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
    
  searchUsers: (query: string) =>
    apiRequest(`/users/search?q=${encodeURIComponent(query)}`),
    
  getCurrentUser: () =>
    apiRequest('/users/me'),
};

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  register: (userData: any) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
};

export default apiRequest;