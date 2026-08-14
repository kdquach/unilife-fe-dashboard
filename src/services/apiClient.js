import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("unilife_access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
        config.headers.delete("content-type");
      } else {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Handle 401 Unauthorized with Token Refresh
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      const refreshToken = localStorage.getItem("unilife_refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("unilife_access_token");
        localStorage.removeItem("unilife_refresh_token");
        localStorage.removeItem("unilife_admin_user");
        // Redirect to login page
        window.location.href = '/login';
        const message = error?.response?.data?.message || 'Session expired. Please log in again.';
        return Promise.reject(new Error(message));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
        const data = response?.data?.data || response?.data;
        const newAccessToken = data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem("unilife_access_token", newAccessToken);
          if (data?.refreshToken) {
            localStorage.setItem("unilife_refresh_token", data.refreshToken);
          }
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error("Invalid token refresh response");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("unilife_access_token");
        localStorage.removeItem("unilife_refresh_token");
        localStorage.removeItem("unilife_admin_user");
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(new Error("Session expired. Please log in again."));
      } finally {
        isRefreshing = false;
      }
    }

    const message = error?.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
