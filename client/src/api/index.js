import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me', data),
    changePassword: (data) => api.put('/auth/password', data),
    logout: () => api.post('/auth/logout'),
};

// Video API
export const videoAPI = {
    upload: (file, title, description, tags, onProgress) => {
        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        if (description) formData.append('description', description);
        if (tags) formData.append('tags', tags);

        return api.post('/videos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                if (onProgress) onProgress(percentCompleted);
            },
        });
    },
    getAll: (params) => api.get('/videos', { params }),
    getOne: (id) => api.get(`/videos/${id}`),
    getById: (id) => api.get(`/videos/${id}`),
    update: (id, data) => api.put(`/videos/${id}`, data),
    delete: (id) => api.delete(`/videos/${id}`),
    getStats: () => api.get('/videos/stats'),
    reprocess: (id) => api.post(`/videos/${id}/reprocess`),
    getStreamUrl: (id) => `${API_URL}/videos/${id}/stream`,
};

// Export API_URL for direct use
export { API_URL };

// User API (Admin only)
export const userAPI = {
    getAll: (params) => api.get('/users', { params }),
    getOne: (id) => api.get(`/users/${id}`),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    toggleStatus: (id) => api.put(`/users/${id}/status`),
    delete: (id) => api.delete(`/users/${id}`),
    getStats: () => api.get('/users/stats'),
};

export default api;
