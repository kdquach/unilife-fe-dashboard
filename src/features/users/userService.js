import apiClient from '../../services/apiClient';
import { mockUsers } from './mockUsers';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
let users = [...mockUsers];

const delay = (value, ms = 250) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

const EMPTY_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const unwrapListResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];

  return {
    data: items,
    pagination: {
      ...EMPTY_PAGINATION,
      ...(payload.pagination || {}),
    },
  };
};

const unwrapItemResponse = (response) => response?.data ?? response ?? null;

const filterUsers = ({ keyword = '', role, status } = {}) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  return users.filter((user) => {
    const matchesKeyword = !normalizedKeyword ||
      String(user.fullName || '').toLowerCase().includes(normalizedKeyword) ||
      String(user.email || '').toLowerCase().includes(normalizedKeyword) ||
      String(user.phone || '').includes(normalizedKeyword);
    const matchesRole = !role || user.role === role;
    const matchesStatus = status === undefined || status === '' || String(user.isActive) === String(status);
    return matchesKeyword && matchesRole && matchesStatus;
  });
};

export const userService = {
  async getUsers(params = {}) {
  if (!useMock) {
    const response = await apiClient.get('/users', { params });

    return unwrapListResponse(response);
  }

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);

  const filtered = filterUsers(params);
  const start = (page - 1) * limit;

  return delay({
    data: filtered.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: filtered.length,
    },
  });
},

  async getUserById(id) {
    if (!useMock) {
      const response = await apiClient.get(`/users/${id}`);
      return unwrapItemResponse(response);
    }

    const user = users.find((item) => item.id === id);
    return delay({ data: user });
  },

  async createUser(payload) {
    if (!useMock) {
      const response = await apiClient.post('/users', payload);
      return unwrapItemResponse(response);
    }

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
    if (!useMock) {
      const response = await apiClient.patch(`/users/${id}`, payload);
      return unwrapItemResponse(response);
    }

    users = users.map((user) => (user.id === id ? { ...user, ...payload, updatedAt: new Date().toISOString() } : user));
    return delay({ data: users.find((user) => user.id === id) });
  },

  async updateUserStatus(id, isActive) {
    if (!useMock) {
      const response = await apiClient.patch(`/users/${id}/status`, { isActive });
      return unwrapItemResponse(response);
    }

    return this.updateUser(id, { isActive });
  },

  async updateUserRole(id, role) {
    if (!useMock) {
      const response = await apiClient.patch(`/users/${id}/role`, { role });
      return unwrapItemResponse(response);
    }

    return this.updateUser(id, { role });
  },
};
