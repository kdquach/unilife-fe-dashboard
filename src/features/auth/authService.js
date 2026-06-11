import apiClient from '../../services/apiClient';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const authService = {
  async login({ email, password }) {
    if (!useMock) return apiClient.post('/auth/login', { email, password });
    if (!email || !password) throw new Error('Please enter email and password');
    return {
      data: {
        accessToken: 'mock-admin-access-token',
        refreshToken: 'mock-admin-refresh-token',
        user: {
          id: '665000000000000000000001',
          fullName: 'Quách Khánh Duy',
          email,
          role: 'ADMIN',
        },
      },
    };
  },

  async logout() {
    const token = localStorage.getItem('unilife_access_token');
    try {
      if (token && !useMock) await apiClient.post('/auth/logout');
    } catch {
      // Local session cleanup should still happen if the server is unavailable.
    } finally {
      localStorage.removeItem('unilife_access_token');
      localStorage.removeItem('unilife_refresh_token');
      localStorage.removeItem('unilife_admin_user');
    }
  },
};
