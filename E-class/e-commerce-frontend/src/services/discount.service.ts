import { axiosClient } from "./axiosClient";

export const discountService = {
  validateVoucher: (code: string, subtotal: number) => {
    return axiosClient.post('/v1/discounts/validate', { code, subtotal });
  },
  getPublicPromotions: () => {
    return axiosClient.get('/v1/promotions/public');
  },
};