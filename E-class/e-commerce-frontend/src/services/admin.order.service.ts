import { axiosClient } from "./axiosClient";

export const adminOrderService = {
  getAllOrders: (params: any) => {
    return axiosClient.get("/v1/orders", { params });
  },

  getOrderById: (orderId: number) => {
    return axiosClient.get(`/v1/orders/${orderId}`);
  },

  updateOrderStatus: (orderId: number, status: string) => {
    return axiosClient.patch(`/v1/orders/${orderId}/status`, null, {
      params: { status },
    });
  },

};
