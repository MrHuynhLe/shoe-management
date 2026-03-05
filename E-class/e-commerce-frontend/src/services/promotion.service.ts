import { axiosClient } from "./axiosClient";

export interface PromotionRequest {
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export const promotionService = {
  getAll: (params: any) => {
    return axiosClient.get("/v1/promotions", { params });
  },
  create: (data: PromotionRequest) => {
    return axiosClient.post("/v1/promotions", data);
  },
  update: (id: number, data: PromotionRequest) => {
    return axiosClient.put(`/v1/promotions/${id}`, data);
  },
  delete: (id: number) => {
    return axiosClient.delete(`/v1/promotions/${id}`);
  },
};