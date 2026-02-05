import api from "./api";
import type { Task } from "@/types";

export interface TodayJobsResponse {
  Status: boolean;
  Message: string;
  ResultOnDb: Task[];
  TotalCountOnDb: number;
}

export const todayJobsService = {
  getSubordinateTasks: async (date?: string): Promise<TodayJobsResponse> => {
    const params = date ? { date } : {};
    const response = await api.get<TodayJobsResponse>("/today-jobs", {
      params,
    });
    return response.data;
  },
};
