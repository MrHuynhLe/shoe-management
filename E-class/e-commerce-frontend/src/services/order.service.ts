import { axiosClient } from './axiosClient';

interface ShippingInfo {
  customerName: string;
  phone: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  note?: string;
}

interface OrderItem {
  variantId: number;
  quantity: number;
}

export interface PlaceOrderDTO {
  shippingInfo: ShippingInfo;
  paymentMethodCode: string;
  items: OrderItem[];
  voucherCode?: string | null;
}

export interface OnlineVnpayCreateResponse {
  orderId: number;
  orderCode: string;
  txnRef: string;
  paymentUrl: string;
}

export interface OnlineVnpayReturnResponse {
  success: boolean;
  message: string;
  txnRef?: string;
  transactionNo?: string;
  responseCode?: string;
  orderId?: number;
}

export const orderService = {
  placeOrder: (orderData: PlaceOrderDTO) => {
    return axiosClient.post('/v1/orders', orderData);
  },

  createOnlineVnpayPayment: (orderId: number) => {
    return axiosClient.post<OnlineVnpayCreateResponse>(`/v1/orders/${orderId}/vnpay`);
  },

  getOnlineVnpayReturnResult: (params: Record<string, string>) => {
    return axiosClient.get<OnlineVnpayReturnResponse>("/v1/orders/vnpay/return", {
      params,
    });
  },

  getMyOrders: (params?: any) => {
    return axiosClient.get('/v1/orders/my-orders', { params });
  },

  getOrderDetails: (orderId: number, config?: any) => {
    return axiosClient.get(`/v1/orders/${orderId}`, config);
  },

  cancelOrder: (orderId: number) => {
    return axiosClient.put(`/v1/orders/${orderId}/cancel`);
  },

  getUserShippingAddresses: () => {
    return axiosClient.get('/v1/orders/shipping-addresses');
  },
};