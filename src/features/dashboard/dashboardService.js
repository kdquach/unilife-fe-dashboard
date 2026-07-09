import apiClient from "../../services/apiClient";
import { DASHBOARD_ALLOWED_ROLES } from "../../constants/roles";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 1,
  total: 0,
  totalPages: 0,
};

const getPayload = (response) => response?.data ?? response ?? {};

const unwrapListResponse = (response) => {
  const payload = getPayload(response);
  const source = payload.data ?? payload;
  const items = Array.isArray(source.items)
    ? source.items
    : Array.isArray(source)
      ? source
      : [];
  const pagination = source.pagination ?? payload.pagination ?? {};

  return {
    data: items,
    pagination: {
      ...DEFAULT_PAGINATION,
      ...pagination,
    },
  };
};

const unwrapMonitorResponse = (response) => {
  const payload = getPayload(response);

  return {
    currentServing: payload.currentServing ?? null,
    waiting: Array.isArray(payload.waiting) ? payload.waiting : [],
    summary: payload.summary ?? {},
    pagination: payload.pagination ?? DEFAULT_PAGINATION,
  };
};

const getCount = async (path, params = {}) => {
  const response = await apiClient.get(path, {
    params: {
      page: 1,
      limit: 1,
      ...params,
    },
  });

  return unwrapListResponse(response).pagination.total || 0;
};

const getList = async (path, params = {}) => {
  const response = await apiClient.get(path, { params });
  return unwrapListResponse(response);
};

const getUsersOverview = async () => {
  const [total, active, inactive, recent, customers, ...roleCounts] =
    await Promise.all([
      getCount("/users"),
      getCount("/users", { isActive: true }),
      getCount("/users", { isActive: false }),
      getList("/users", {
        page: 1,
        limit: 6,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
      getCount("/users", { role: "CUSTOMER" }),
      ...DASHBOARD_ALLOWED_ROLES.map((role) => getCount("/users", { role })),
    ]);

  const staff = roleCounts.reduce((sum, count) => sum + count, 0);

  return {
    total,
    active,
    inactive,
    staff,
    customers: customers || Math.max(total - staff, 0),
    activeRate: total > 0 ? Math.round((active / total) * 100) : 0,
    recentUsers: recent.data,
  };
};

const getOrdersOverview = async () => {
  const [total, pending, pendingPayment, completed, cancelled] = await Promise.all([
    getCount("/orders"),
    getCount("/orders", { status: "PENDING" }),
    getCount("/orders", { status: "PENDING_PAYMENT" }),
    getCount("/orders", { status: "COMPLETED" }),
    getCount("/orders", { status: "CANCELLED" }),
  ]);

  return {
    total,
    pending: pending + pendingPayment,
    completed,
    cancelled,
  };
};

const getModuleOverview = async () => {
  const [ingredients, ingredientCategories, foodCategories, suppliers] =
    await Promise.all([
      getCount("/ingredients"),
      getCount("/ingredient-categories"),
      getCount("/food-categories"),
      getCount("/suppliers"),
    ]);

  return {
    ingredients,
    ingredientCategories,
    foodCategories,
    suppliers,
  };
};

const getQueueOverview = async () => {
  const response = await apiClient.get("/queues/monitor", {
    params: {
      page: 1,
      limit: 10,
    },
  });

  return unwrapMonitorResponse(response);
};

export const dashboardService = {
  getUsersOverview,
  getOrdersOverview,
  getModuleOverview,
  getQueueOverview,
};
