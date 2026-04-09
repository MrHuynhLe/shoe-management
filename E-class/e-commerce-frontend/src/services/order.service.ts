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

interface PlaceOrderDTO {
  shippingInfo: ShippingInfo;
  paymentMethodCode: string;
  items: OrderItem[];
  voucherCode?: string | null;
}

export const orderService = {
  placeOrder: (orderData: PlaceOrderDTO) => {
    return axiosClient.post('/v1/orders', orderData);
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