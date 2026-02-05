import api from "./api";
import type { ApiResponse, Department } from "@/types";

export const departmentService = {
  search: async () => {
    const { data } = await api.post<ApiResponse<Department[]>>(
      "/departments/search",
      { limit: 100 },
    );
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Department>>(
      `/departments/${id}`,
    );
    return data;
  },

  getHierarchy: async () => {
    const { data } = await api.get<ApiResponse<Department[]>>(
      "/departments/hierarchy",
    );
    return data;
  },

  create: async (department: Partial<Department>) => {
    const { data } = await api.post<ApiResponse>("/departments", department);
    return data;
  },

  update: async (id: number, department: Partial<Department>) => {
    const { data } = await api.put<ApiResponse>(
      `/departments/${id}`,
      department,
    );
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse>(`/departments/${id}`);
    return data;
  },
};
