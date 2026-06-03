import apiClient from '../../services/apiClient';
import { mockUsers } from './mockUsers';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';
let users = [...mockUsers];

const delay = (value, ms = 250) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

const filterUsers = ({ keyword = '', role, status } = {}) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  return users.filter((user) => {
    const matchesKeyword = !normalizedKeyword ||
      user.fullName.toLowerCase().includes(normalizedKeyword) ||
      user.email.toLowerCase().includes(normalizedKeyword) ||
      user.phone.includes(normalizedKeyword);
    const matchesRole = !role || user.role === role;
    const matchesStatus = status === undefined || status === '' || String(user.isActive) === String(status);
    return matchesKeyword && matchesRole && matchesStatus;
  });
};

export const userService = {
  async getUsers(params = {}) {
    if (!useMock) return apiClient.get('/users', { params });
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 10);
    const filtered = filterUsers(params);
    const start = (page - 1) * limit;
    return delay({
      data: filtered.slice(start, start + limit),
      pagination: { page, limit, total: filtered.length },
    });
  },

  async getUserById(id) {
    if (!useMock) return apiClient.get(`/users/${id}`);
    const user = users.find((item) => item.id === id);
    return delay({ data: user });
  },

  async createUser(payload) {
    if (!useMock) return apiClient.post('/users', payload);
    const newUser = {
      id: `${Date.now()}`,
      avatarUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      ...payload,
    };
    users = [newUser, ...users];
    return delay({ data: newUser });
  },

  async updateUser(id, payload) {
    if (!useMock) return apiClient.patch(`/users/${id}`, payload);
    users = users.map((user) => (user.id === id ? { ...user, ...payload, updatedAt: new Date().toISOString() } : user));
    return delay({ data: users.find((user) => user.id === id) });
  },

  async updateUserStatus(id, isActive) {
    if (!useMock) return apiClient.patch(`/users/${id}/status`, { isActive });
    return this.updateUser(id, { isActive });
  },

  async updateUserRole(id, role) {
    if (!useMock) return apiClient.patch(`/users/${id}/role`, { role });
    return this.updateUser(id, { role });
  },
};
