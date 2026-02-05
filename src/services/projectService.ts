import api from "./api";
import type { ApiResponse, Project } from "@/types";

export const projectService = {
  search: async (params?: Record<string, unknown>) => {
    const { data } = await api.post<ApiResponse<Project[]>>(
      "/projects/search",
      params,
    );
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return data;
  },

  create: async (project: Partial<Project>) => {
    const { data } = await api.post<ApiResponse<{ insertId: number }>>(
      "/projects",
      project,
    );
    return data;
  },

  update: async (id: number, project: Partial<Project>) => {
    const { data } = await api.put<ApiResponse>(`/projects/${id}`, project);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse>(`/projects/${id}`);
    return data;
  },

  // Helper: Get progress (prefer backend-calculated, fallback to manual calculation)
  getProgress: (project: Project): number => {
    // Use backend-calculated progress if available
    if (project.CALCULATED_PROGRESS !== undefined) {
      return project.CALCULATED_PROGRESS;
    }
    // Fallback to frontend calculation
    const total = project.TASK_COUNT || 0;
    const completed = project.COMPLETED_TASK_COUNT || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  },

  getMembers: async (projectId: number) => {
    const { data } = await api.get<ApiResponse>(
      `/projects/${projectId}/members`,
    );
    return data;
  },

  addMember: async (
    projectId: number,
    userId: number,
    role: string = "MEMBER",
  ) => {
    const { data } = await api.post<ApiResponse>(
      `/projects/${projectId}/members`,
      { userId, role },
    );
    return data;
  },

  finalize: async (projectId: number) => {
    const { data } = await api.post<ApiResponse>(
      `/projects/${projectId}/finalize`,
    );
    return data;
  },

  getAnalytics: async (projectId: number) => {
    const { data } = await api.get<ApiResponse>(
      `/projects/${projectId}/analytics`,
    );
    return data;
  },
};
