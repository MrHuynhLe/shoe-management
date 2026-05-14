import { axiosClient } from './axiosClient';

export interface PromotionRequest {
  name: string;
  description?: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status?: boolean;
  productIds?: number[];
  variantIds?: number[];
}

export interface Promotion {
  id: number;
  name: string;
  description?: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: boolean;
  productCount: number;
  variantCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionAppliedIds {
  productIds: number[];
  variantIds: number[];
}

export const promotionService = {
  getAll: (params?: any) => {
    return axiosClient.get('/promotions/admin/all', { params });
  },

  create: (data: PromotionRequest) => {
    return axiosClient.post('/promotions/admin', data);
  },

  update: (id: number, data: PromotionRequest) => {
    return axiosClient.put(`/promotions/admin/${id}`, data);
  },

  delete: (id: number) => {
    return axiosClient.delete(`/promotions/admin/${id}`);
  },

  toggle: (id: number) => {
    return axiosClient.patch(`/promotions/admin/${id}/toggle`);
  },

  getAppliedIds: (id: number) => {
    return axiosClient.get<PromotionAppliedIds>(`/promotions/${id}/products/ids`);
  },
};
