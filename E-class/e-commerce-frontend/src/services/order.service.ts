import { axiosClient } from "./axiosClient";

// A DTO for placing an order
interface PlaceOrderDTO {
  shippingInfo: {
    customerName: string;
    phone: string;
    address: string;
    note?: string;
  };
  paymentMethodCode: string; // e.g., 'COD', 'BANK_TRANSFER'
  items: {
    variantId: number;
    quantity: number;
  }[];
  voucherCode?: string | null;
}

export const orderService = {
  placeOrder: (orderData: PlaceOrderDTO) => {
    return axiosClient.post("/v1/orders", orderData);
  },
  getMyOrders: (params?: any) => {
    return axiosClient.get("/v1/orders/my-orders", { params });
  },
};