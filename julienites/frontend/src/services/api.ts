const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// API Response Types
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface UserResponse {
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

// Log API calls with different colors for request/response
export const logApiCall = (method: string, url: string, data?: any, response?: any, status?: number) => {
  const timestamp = new Date().toISOString();

  console.group(`%cAPI Call: ${method} ${url}`, 'color: #1d9bf0; font-weight: bold;');
  console.log(`%cTimestamp: ${timestamp}`, 'color: #666;');

  if (data) {
    console.log('%cRequest:', 'color: #00ba7c; font-weight: bold;', data);
  }

  if (response) {
    const statusColor = status && status >= 200 && status < 300 ? '#00ba7c' : '#f91880';
    console.log(`%cResponse (${status}):`, `color: ${statusColor}; font-weight: bold;`, response);
  }

  console.groupEnd();
};
  
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
  const method = options.method || 'GET';

  // Log request
  if (options.body && method !== 'GET') {
    try {
      const requestData = JSON.parse(options.body as string);
      logApiCall(method, url, requestData);
    } catch (e) {
      logApiCall(method, url, options.body);
    }
  } else {
    logApiCall(method, url);
  }

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
    
    // Log response
    logApiCall(method, url, undefined, data, response.status);
    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.detail || data.message || `HTTP ${response.status}`,
      status: response.status,
    };
  } catch (error) {
    console.error(`%cAPI Error: ${method} ${url}`, 'color: #f91880; font-weight: bold;', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

export const userApi = {
  getProfile: (userId: string) => 
    apiRequest<UserResponse>(`/users/${userId}`),
    
  updateProfile: (userId: string, profileData: any) =>
    apiRequest<UserResponse>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
    
  searchUsers: (query: string) =>
    apiRequest<UserResponse[]>(`/users/search?q=${encodeURIComponent(query)}`),
    
  getCurrentUser: () =>
    apiRequest<UserResponse>('/users/me'),
};

export const authApi = {
  login: (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
  },

  register: (userData: any) =>
    apiRequest<UserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
};

export default apiRequest;