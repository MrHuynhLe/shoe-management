import { axiosClient } from "./axiosClient";
import type { Color, ColorRequest } from "@/features/color/color.model";

export const colorService = {
  getAll: async (): Promise<Color[]> => {
    const res = await axiosClient.get<Color[]>("/v1/colors");
    return res.data;
  },

  create: async (payload: ColorRequest): Promise<Color> => {
    const res = await axiosClient.post<Color>("/v1/colors", payload);
    return res.data;
  },

  update: async (id: number, payload: ColorRequest): Promise<Color> => {
    const res = await axiosClient.put<Color>(`/v1/colors/${id}`, payload);
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await axiosClient.delete(`/v1/colors/${id}`);
  },
};