import { axiosClient } from "./axiosClient";

export interface PaymentMethodResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

export const paymentMethodService = {
  getAll: async (): Promise<PaymentMethodResponse[]> => {
    const res = await axiosClient.get("/v1/payment-methods");
    return res.data;
  },
};