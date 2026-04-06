import axios from 'axios';

// In production (Vercel), frontend and backend share the same domain.
// Use a relative path so API calls go to the same host automatically.
// In local development, proxy in vite.config.js forwards /api → localhost:5000.
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            try {
                const { state } = JSON.parse(authStorage);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch (e) {
                // Ignore parse errors safely
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - redirect to login only if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// API helper functions
export const studentApi = {
    getResults: (params) => api.get('/student/results', { params }),
    getTrends: () => api.get('/student/trends'),
    getTranscript: () => api.get('/student/transcript'),
    submitQuery: (data) => api.post('/student/query', data),
    getQueryStatus: (id) => api.get(`/student/query/${id}`),
    updateAvatar: (formData) => api.put('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateProfile: (data) => api.put('/auth/profile', data)
};

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    uploadResults: (formData) => api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getStudents: (params) => api.get('/admin/students', { params }),
    addStudent: (data) => api.post('/admin/students', data),
    updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
    deleteStudent: (id) => api.delete(`/admin/students/${id}`),
    getStudentDetails: (id) => api.get(`/admin/students/${id}`),
    updateResult: (id, data) => api.put(`/admin/results/${id}`, data),
    addResult: (data) => api.post('/admin/results', data),
    deleteResult: (id) => api.delete(`/admin/results/${id}`),
    getAgentLogs: (params) => api.get('/admin/agent-logs', { params }),
    getInsights: (params) => api.get('/admin/insights', { params }),
    acknowledgeInsight: (id) => api.put(`/admin/insights/${id}/acknowledge`)
};

export const superAdminApi = {
    getAuditLogs: (params) => api.get('/superadmin/audit-logs', { params }),
    getUsers: (params) => api.get('/superadmin/users', { params }),
    updateUserRole: (id, role) => api.put(`/superadmin/users/${id}/role`, { role }),
    toggleUserStatus: (id) => api.put(`/superadmin/users/${id}/status`),
    createAdmin: (data) => api.post('/superadmin/users/admin', data),
    deleteUser: (id) => api.delete(`/superadmin/users/${id}`),
    groundAgent: (logId, reason) => api.post(`/superadmin/agent/ground/${logId}`, { reason }),
    getAgentStats: (params) => api.get('/superadmin/agent/stats', { params }),
    getConfig: () => api.get('/superadmin/config'),
    updateConfig: (data) => api.put('/superadmin/config', data)
};

export const searchApi = {
    search: (params) => api.get('/search', { params }),
    getSuggestions: (params) => api.get('/search/suggestions', { params })
};
