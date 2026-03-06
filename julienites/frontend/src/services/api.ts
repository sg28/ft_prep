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

    // On 401, clear stored session and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('julienites-token');
      localStorage.removeItem('julienites-refresh-token');
      localStorage.removeItem('julienites-user');
      window.location.href = '/login';
    }

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

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('julienites-token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const userApi = {
  getUsers: (skip: number = 0, limit: number = 100) =>
    apiRequest<UserResponse[]>(`/users/?skip=${skip}&limit=${limit}`, {
      headers: getAuthHeaders(),
    }),

  getProfile: (userId: string) =>
    apiRequest<UserResponse>(`/users/${userId}`, {
      headers: getAuthHeaders(),
    }),

  updateProfile: (userId: string, profileData: any) =>
    apiRequest<UserResponse>(`/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    }),
    
  searchUsers: (query: string) =>
    apiRequest<UserResponse[]>(`/search/users?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    }),

  getCurrentUser: (token?: string) => {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return apiRequest<UserResponse>('/users/me', {
      method: 'GET',
      headers,
    });
  },

  uploadAvatar: async (userId: string, file: File): Promise<ApiResponse<UserResponse>> => {
    const url = `${API_BASE_URL}/users/${userId}/avatar`;
    const formData = new FormData();
    formData.append('file', file);
    logApiCall('POST', url, { fileName: file.name, fileSize: file.size });
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...getAuthHeaders() }, // NO Content-Type - browser sets multipart boundary
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      logApiCall('POST', url, undefined, data, response.status);
      if (response.status === 401) {
        localStorage.removeItem('julienites-token');
        window.location.href = '/login';
      }
      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.detail || `HTTP ${response.status}`,
        status: response.status,
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error', status: 0 };
    }
  },
};

interface ConnectionStatus {
  user_id: string;
  is_following: boolean;
  is_followed_by: boolean;
  mutual_follow: boolean;
}

export const connectionApi = {
  follow: (userId: string) =>
    apiRequest<{ message: string }>(`/connections/follow/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }),

  unfollow: (userId: string) =>
    apiRequest<{ message: string }>(`/connections/follow/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }),

  getStatus: (userId: string) =>
    apiRequest<ConnectionStatus>(`/connections/status/${userId}`, {
      headers: getAuthHeaders(),
    }),
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

export const POST_TAGS = ['Questions', 'Celebration', 'Alert', 'Social', 'Post Truth'] as const;
export type PostTag = typeof POST_TAGS[number];

interface PostResponse {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  is_public: boolean;
  is_anonymous: boolean;
  tag?: PostTag | null;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  liked_by_me?: boolean;
  created_at: string;
  updated_at?: string;
  user: UserResponse;
}

interface PostCreateRequest {
  content: string;
  media_urls?: string[];
  is_public?: boolean;
  is_anonymous?: boolean;
  tag?: PostTag | null;
}

export const postApi = {
  getFeedPosts: (token: string, skip: number = 0, limit: number = 50, tag?: string | null, days?: number | null) => {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (tag) params.set('tag', tag);
    if (days) params.set('days', String(days));
    return apiRequest<PostResponse[]>(`/posts/?${params.toString()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  getUserPosts: (token: string, userId: string, skip: number = 0, limit: number = 50) =>
    apiRequest<PostResponse[]>(`/posts/user/${userId}?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  getPost: (token: string, postId: string) =>
    apiRequest<PostResponse>(`/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  createPost: (token: string, postData: PostCreateRequest) =>
    apiRequest<PostResponse>('/posts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    }),

  updatePost: (token: string, postId: string, postData: Partial<PostCreateRequest>) =>
    apiRequest<PostResponse>(`/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    }),

  deletePost: (token: string, postId: string) =>
    apiRequest(`/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  likePost: (token: string, postId: string) =>
    apiRequest(`/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  unlikePost: (token: string, postId: string) =>
    apiRequest(`/posts/${postId}/like`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  getPostComments: (token: string, postId: string, skip: number = 0, limit: number = 50) =>
    apiRequest(`/posts/${postId}/comments?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  createComment: (token: string, postId: string, commentData: any) =>
    apiRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    }),
};

// Forms API
export interface FormField {
  id?: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  order?: number;
}

export interface Form {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  allow_public_submissions: boolean;
  created_at: string;
  updated_at?: string;
  fields: FormField[];
  responses_count: number;
}

export interface FormCreateReq {
  title: string;
  description?: string;
  allow_public_submissions?: boolean;
  fields: Omit<FormField, 'id'>[];
}

export interface FormResponseItem {
  id: string;
  form_id: string;
  user_id?: string;
  data: Record<string, any>;
  submitted_at: string;
}

export const formsApi = {
  list: () => apiRequest<Form[]>(`/forms/`, { headers: getAuthHeaders() }),
  create: (form: FormCreateReq) => apiRequest<Form>(`/forms/`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(form) }),
  get: (id: string) => apiRequest<Form>(`/forms/${id}`, { headers: getAuthHeaders() }),
  update: (id: string, form: FormCreateReq) => apiRequest<Form>(`/forms/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(form) }),
  remove: (id: string) => apiRequest<{ message: string }>(`/forms/${id}`, { method: 'DELETE', headers: getAuthHeaders() }),
  submitResponse: (id: string, data: Record<string, any>) => apiRequest<FormResponseItem>(`/forms/${id}/responses`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ data }) }),
  listResponses: (id: string, limit = 50, offset = 0) => apiRequest<FormResponseItem[]>(`/forms/${id}/responses?limit=${limit}&offset=${offset}`, { headers: getAuthHeaders() }),
  recentResponses: (limit = 10) => apiRequest<FormResponseItem[]>(`/forms/responses/recent?limit=${limit}`, { headers: getAuthHeaders() }),
};

export interface DatasetAnalysis {
  filename: string;
  filetype: string;
  rows: number;
  columns: string[];
  samples: Array<Record<string, any>>;
  summaries: Array<{
    name: string;
    missing: number;
    numeric?: { count: number; mean?: number; min?: number; max?: number };
    top_values?: Array<{ value: string; count: number }>;
  }>;
  note?: string | null;
}

export const datasetsApi = {
  analyze: async (file: File) => {
    const url = `${API_BASE_URL}/datasets/analyze`;
    const formData = new FormData();
    formData.append('upload', file);
    logApiCall('POST', url, { fileName: file.name, fileSize: file.size });
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...getAuthHeaders() }, // allow browser to set multipart boundary
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      logApiCall('POST', url, undefined, data, response.status);
      return { data: response.ok ? (data as DatasetAnalysis) : undefined, error: response.ok ? undefined : data.detail || `HTTP ${response.status}`, status: response.status };
    } catch (e) {
      return { status: 0, error: e instanceof Error ? e.message : 'Network error' } as ApiResponse<DatasetAnalysis>;
    }
  },
};

export default apiRequest;