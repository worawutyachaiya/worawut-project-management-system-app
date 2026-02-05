import api from "./api";
import type { ApiResponse, TaskFile } from "@/types";

export const fileService = {
  search: async (taskId: number) => {
    const { data } = await api.get<ApiResponse<TaskFile[]>>(
      `/files/tasks/${taskId}`,
    );
    return data;
  },

  upload: async (taskId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<ApiResponse>(
      `/files/tasks/${taskId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse>(`/files/${id}`);
    return data;
  },
};
