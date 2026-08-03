import apiClient from '../../services/apiClient';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const authService = {
  async login({ email, password, rememberMe }) {
    if (!useMock) {
      return apiClient.post('/auth/login', { email, password, rememberMe });
    }
    if (!email || !password) throw new Error('Please enter email and password');
    return {
      data: {
        accessToken: 'mock-admin-access-token',
        refreshToken: 'mock-admin-refresh-token',
        user: {
          id: '665000000000000000000001', 
          fullName: 'UniLife Administrator',
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

  async requestPasswordReset(email) {
    if (!useMock) {
      return apiClient.post('/auth/forgot-password', {
        email,
        audience: 'DASHBOARD',
      });
    }
    if (!email) throw new Error('Please enter your email address');
    return { data: null };
  },

  async resendPasswordResetOtp(email) {
    if (!useMock) {
      return apiClient.post('/auth/resend-forgot-password-otp', {
        email,
        audience: 'DASHBOARD',
      });
    }
    if (!email) throw new Error('Please enter your email address');
    return { data: null };
  },

  async resetPassword({ email, otp, newPassword }) {
    if (!useMock) {
      return apiClient.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
        audience: 'DASHBOARD',
      });
    }
    if (!email || !otp || !newPassword) {
      throw new Error('Please complete all required fields');
    }
    return { data: null };
  },
};
