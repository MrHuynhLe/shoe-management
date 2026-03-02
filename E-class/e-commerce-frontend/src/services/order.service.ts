import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const orderService = {
  createOrder: (data: {
    customerId: number;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    paymentMethod: string;
    note?: string;
    voucherCode?: string;
    items: Array<{ productVariantId: number; quantity: number }>;
  }) => api.post("/v1/orders", data),

  getOrders: (page = 0, size = 10, status?: string) =>
    api.get("/v1/orders", { params: { page, size, status } }),

  getOrderDetail: (orderId: number) =>
    api.get(`/v1/orders/${orderId}`),

  updateOrderStatus: (orderId: number, status: string) =>
    api.put(`/v1/orders/${orderId}/status`, { status }),

  searchOrders: (keyword: string, status?: string, page = 0, size = 10) =>
    api.get("/v1/orders/search", { params: { keyword, status, page, size } }),

  getMyOrders: (customerId: number, page = 0, size = 10) =>
    api.get(`/v1/orders/customer/${customerId}`, { params: { page, size } }),
};
