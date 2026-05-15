import { axiosClient } from "./axiosClient";

export const discountService = {
  validateVoucher: (code: string, items: { variantId: number; quantity: number }[]) => {
    return axiosClient.post('/v1/discounts/validate', { code, items });
  },
  getPublicPromotions: () => {
    return axiosClient.get('/v1/promotions/public');
  },
};
