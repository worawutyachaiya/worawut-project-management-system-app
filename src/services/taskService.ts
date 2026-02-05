import api from "./api";
import type { ApiResponse, Task } from "@/types";

export const taskService = {
  search: async (params?: Record<string, unknown>) => {
    const { data } = await api.post<ApiResponse<Task[]>>(
      "/tasks/search",
      params,
    );
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data;
  },

  create: async (task: Partial<Task>) => {
    const { data } = await api.post<
      ApiResponse<{ insertId: number; CODE: string }>
    >("/tasks", task);
    return data;
  },

  update: async (id: number, task: Partial<Task>) => {
    const { data } = await api.put<ApiResponse>(`/tasks/${id}`, task);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse>(`/tasks/${id}`);
    return data;
  },

  submit: async (taskId: number) => {
    const { data } = await api.post<ApiResponse>(`/tasks/${taskId}/submit`);
    return data;
  },

  getHistory: async (taskId: number) => {
    const { data } = await api.get<ApiResponse>(`/tasks/${taskId}/history`);
    return data;
  },

  addAssignee: async (
    taskId: number,
    userId: number,
    isPrimary: boolean = false,
  ) => {
    const { data } = await api.post<ApiResponse>(`/tasks/${taskId}/assignees`, {
      userId,
      isPrimary,
    });
    return data;
  },

  removeAssignee: async (taskId: number, userId: number) => {
    const { data } = await api.delete<ApiResponse>(
      `/tasks/${taskId}/assignees/${userId}`,
    );
    return data;
  },

  getCompletionHistory: async (taskId: number) => {
    const { data } = await api.get<ApiResponse<any[]>>(
      `/tasks/${taskId}/completion-history`,
    );
    return data;
  },
};

export const approvalService = {
  getPending: async () => {
    const { data } = await api.get<ApiResponse>("/approvals/pending");
    return data;
  },

  approve: async (taskId: number, comments?: string) => {
    const { data } = await api.post<ApiResponse>(
      `/approvals/tasks/${taskId}/approve`,
      { comments },
    );
    return data;
  },

  reject: async (taskId: number, comments?: string) => {
    const { data } = await api.post<ApiResponse>(
      `/approvals/tasks/${taskId}/reject`,
      { comments },
    );
    return data;
  },

  requestRevision: async (taskId: number, comments?: string) => {
    const { data } = await api.post<ApiResponse>(
      `/approvals/tasks/${taskId}/request-revision`,
      { comments },
    );
    return data;
  },
};
