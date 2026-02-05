import api from "./api";
import type { ApiResponse, Comment } from "@/types";

export const commentService = {
  search: async (taskId: number) => {
    const { data } = await api.get<ApiResponse<Comment[]>>(
      `/comments/tasks/${taskId}`,
    );
    return data;
  },

  create: async (taskId: number, content: string) => {
    const { data } = await api.post<ApiResponse>(`/comments/tasks/${taskId}`, {
      CONTENT: content,
    });
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse>(`/comments/${id}`);
    return data;
  },
};
