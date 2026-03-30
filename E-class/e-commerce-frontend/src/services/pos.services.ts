import { axiosClient } from "./axiosClient";


export interface PosOrderItemResponse {
  itemId: number;
  productVariantId: number;
  variantCode: string;
  barcode: string;
  productName: string;
  color?: string | null;
  size?: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
  stockQuantity: number;
  imageUrl?: string | null;
}

export interface PosOrderResponse {
  orderId: number;
  orderCode: string;
  status: string;
  customerId?: number | null;
  customerName?: string | null;
  employeeId?: number | null;
  employeeName?: string | null; 
  storeId?: number | null;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  customerPaid: number;
  changeAmount: number;
  orderType?: string | null;
  note?: string | null;
  voucherCode?: string | null; 
  items: PosOrderItemResponse[];
}

export interface PosProductSearchResponse {
  productVariantId: number;
  variantCode: string;
  barcode: string;
  productCode: string;
  productName: string;
  color?: string | null;
  size?: string | null;
  sellingPrice: number;
  stockQuantity: number;
  imageUrl?: string | null;
}

export interface PosCreateOrderRequest {
  employeeId: number;
  customerId?: number | null;
  storeId: number;
  orderType: string; 
  note?: string;
}

export interface PosAddItemRequest {
  productVariantId: number;
  quantity: number;
}

export interface PosUpdateItemRequest {
  quantity: number;
}

export interface PosAssignCustomerRequest {
  customerId: number | null;
}

export interface PosCheckoutRequest {
  paymentMethodId: number;
  customerPaid: number;
  discountAmount: number;
  note?: string;
}

export interface PosApplyVoucherRequest {
  voucherCode: string;
}

const POS_BASE = '/v1/pos';

export const posService = {
  createOrder: async (payload: PosCreateOrderRequest): Promise<PosOrderResponse> => {
    const res = await axiosClient.post(`${POS_BASE}/orders`, payload);
    return res.data;
  },

  getDraftOrders: async (): Promise<PosOrderResponse[]> => {
    const res = await axiosClient.get(`${POS_BASE}/orders/drafts`);
    return res.data;
  },

  getOrderDetail: async (orderId: number): Promise<PosOrderResponse> => {
    const res = await axiosClient.get(`${POS_BASE}/orders/${orderId}`);
    return res.data;
  },

  searchProducts: async (keyword: string): Promise<PosProductSearchResponse[]> => {
    const res = await axiosClient.get(`${POS_BASE}/products/search`, {
      params: { keyword },
    });
    return res.data;
  },

  getProductByBarcode: async (barcode: string): Promise<PosProductSearchResponse> => {
    const res = await axiosClient.get(`${POS_BASE}/products/barcode/${barcode}`);
    return res.data;
  },

  addItem: async (orderId: number, payload: PosAddItemRequest): Promise<PosOrderResponse> => {
    const res = await axiosClient.post(`${POS_BASE}/orders/${orderId}/items`, payload);
    return res.data;
  },

  updateItem: async (
    orderId: number,
    itemId: number,
    payload: PosUpdateItemRequest
  ): Promise<PosOrderResponse> => {
    const res = await axiosClient.put(`${POS_BASE}/orders/${orderId}/items/${itemId}`, payload);
    return res.data;
  },

  removeItem: async (orderId: number, itemId: number): Promise<PosOrderResponse> => {
    const res = await axiosClient.delete(`${POS_BASE}/orders/${orderId}/items/${itemId}`);
    return res.data;
  },

  assignCustomer: async (
    orderId: number,
    payload: PosAssignCustomerRequest
  ): Promise<PosOrderResponse> => {
    const res = await axiosClient.put(`${POS_BASE}/orders/${orderId}/customer`, payload);
    return res.data;
  },

  checkout: async (
    orderId: number,
    payload: PosCheckoutRequest
  ): Promise<PosOrderResponse> => {
    const res = await axiosClient.post(`${POS_BASE}/orders/${orderId}/checkout`, payload);
    return res.data;
  },

  cancelOrder: async (orderId: number): Promise<string> => {
    const res = await axiosClient.post(`${POS_BASE}/orders/${orderId}/cancel`);
    return res.data;
  },

  applyVoucher: async (
    orderId: number,
    payload: PosApplyVoucherRequest
  ): Promise<PosOrderResponse> => {
    const res = await axiosClient.put(`${POS_BASE}/orders/${orderId}/voucher`, payload);
    return res.data;
  },

  removeVoucher: async (orderId: number): Promise<PosOrderResponse> => {
    const res = await axiosClient.delete(`${POS_BASE}/orders/${orderId}/voucher`);
    return res.data;
  },
};