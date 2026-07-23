import apiClient from '../../services/apiClient';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (value, ms = 250) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const profileService = {
  async getProfile() {
    if (!useMock) {
      const response = await apiClient.get('/users/profile');
      return response.data || response;
    }
    const raw = localStorage.getItem('unilife_admin_user');
    const user = raw
      ? JSON.parse(raw)
      : {
          id: '665000000000000000000001',
          fullName: 'System Admin',
          email: 'admin@unilife.com',
          phone: '0901234567',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
    return delay(user);
  },

  async updateProfile(payload) {
    if (!useMock) {
      const response = await apiClient.patch('/users/profile', payload);
      return response.data || response;
    }
    const raw = localStorage.getItem('unilife_admin_user');
    const current = raw ? JSON.parse(raw) : {};
    const updated = { ...current, ...payload };
    localStorage.setItem('unilife_admin_user', JSON.stringify(updated));
    return delay(updated);
  },

  async uploadAvatar(file) {
    if (!useMock) {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await apiClient.post('/users/profile/avatar', formData);
      return response.data || response;
    }
    const mockAvatarUrl = URL.createObjectURL(file);
    const raw = localStorage.getItem('unilife_admin_user');
    const current = raw ? JSON.parse(raw) : {};
    const updated = { ...current, avatarUrl: mockAvatarUrl, avatar: mockAvatarUrl };
    localStorage.setItem('unilife_admin_user', JSON.stringify(updated));
    return delay(updated);
  },

  async changePassword({ currentPassword, newPassword }) {
    if (!useMock) {
      const response = await apiClient.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data || response;
    }
    if (!currentPassword) throw new Error('Vui lòng nhập mật khẩu hiện tại');
    if (!newPassword || newPassword.length < 8)
      throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự');
    if (currentPassword === newPassword)
      throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại');
    return delay({ message: 'Đổi mật khẩu thành công' });
  },
};
