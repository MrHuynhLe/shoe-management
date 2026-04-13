import { axiosClient } from "./axiosClient";

export const adminOrderService = {
  getAllOrders: (params: any) => {
    return axiosClient.get("/v1/orders", { params });
  },

  updateOrderStatus: (orderId: number, status: string) => {
    return axiosClient.patch(`/v1/orders/${orderId}/status`, null, {
      params: { status },
    });
  },

  reviewReturn: (
    orderId: number,
    payload: { action: "APPROVE" | "REJECT"; note?: string },
  ) => {
    return axiosClient.patch(`/v1/orders/${orderId}/return-review`, payload);
  },
};