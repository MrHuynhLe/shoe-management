import { axiosClient } from "./axiosClient";

export interface StoreResponse {
  id: number;
  name: string;
  address?: string;
}

export const storeService = {
  getActiveStores: async (): Promise<StoreResponse[]> => {
    const res = await axiosClient.get("/v1/stores/active");
    return res.data;
  },
};