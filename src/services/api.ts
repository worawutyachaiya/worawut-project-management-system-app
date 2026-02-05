import axios from "axios";
import type { ApiResponse } from "@/types";

const API_BASE = "/api/pms";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        if (data.Status && data.ResultOnDb.accessToken) {
          localStorage.setItem("accessToken", data.ResultOnDb.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.ResultOnDb.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
