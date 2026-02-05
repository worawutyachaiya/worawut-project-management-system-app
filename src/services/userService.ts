import api from "./api";
import type { ApiResponse, User } from "@/types";

export interface UserSearchParams {
  page?: number;
  limit?: number;
  departmentId?: number;
  status?: string;
  search?: string;
}

export const userService = {
  search: async (params?: UserSearchParams) => {
    const { data } = await api.post<ApiResponse<User[]>>("/users/search", {
      page: params?.page || 1,
      limit: params?.limit || 50,
      departmentId: params?.departmentId,
      status: params?.status || "ACTIVE",
      search: params?.search,
    });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data;
  },

  getSubordinates: async (userId: number) => {
    const { data } = await api.get<ApiResponse<User[]>>(
      `/users/${userId}/subordinates`,
    );
    return data;
  },

  create: async (user: Partial<User> & { password?: string }) => {
    const { data } = await api.post<ApiResponse>("/users", user);
    return data;
  },

  update: async (id: number, user: Partial<User>) => {
    const { data } = await api.put<ApiResponse>(`/users/${id}`, user);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse>(`/users/${id}`);
    return data;
  },
};
