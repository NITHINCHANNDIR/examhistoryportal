import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { token, user } = response.data;

                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    return { success: true, user };
                } catch (error) {
                    const message = error.response?.data?.message || 'Login failed';
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            completeOnboarding: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/onboarding', data);
                    const { user } = response.data;

                    set({
                        user,
                        isLoading: false
                    });

                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Onboarding failed';
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/register', userData);
                    const { token, user } = response.data;

                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Registration failed';
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    delete api.defaults.headers.common['Authorization'];
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false
                    });
                }
            },

            checkAuth: async () => {
                const { token } = get();
                if (!token) return false;

                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await api.get('/auth/me');
                    set({ user: response.data.user, isAuthenticated: true });
                    return true;
                } catch (error) {
                    delete api.defaults.headers.common['Authorization'];
                    set({ user: null, token: null, isAuthenticated: false });
                    return false;
                }
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, user: state.user })
        }
    )
);

export default useAuthStore;
