import api from "./api";
import type { ApiResponse, AuthUser, LoginRequest } from "@/types";

interface LoginResponseUser {
  id: number;
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  phone: string | null;
  avatarUrl: string | null;
  departmentId: number | null;
  departmentName: string | null;
  supervisorId: number | null;
  status: string;
}

interface LoginResponseRole {
  id: number;
  code: string;
  name: string;
  level: number;
}

interface LoginResponse {
  accessToken: string;
  user: LoginResponseUser;
  roles: LoginResponseRole[];
}

export const authService = {
  login: async (credentials: LoginRequest) => {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      credentials,
    );
    if (data.Status && data.ResultOnDb.accessToken) {
      localStorage.setItem("accessToken", data.ResultOnDb.accessToken);
    }
    return data;
  },

  logout: async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
  },

  me: async () => {
    const { data } = await api.get<ApiResponse<AuthUser>>("/auth/me");
    return data;
  },

  refresh: async () => {
    const { data } =
      await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh");
    if (data.Status && data.ResultOnDb.accessToken) {
      localStorage.setItem("accessToken", data.ResultOnDb.accessToken);
    }
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.put<ApiResponse>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  },
};
