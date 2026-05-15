import { axiosClient } from "./axiosClient";

export interface CheckoutQuoteItem {
  productId: number;
  variantId: number;
  productName: string;
  variantCode?: string | null;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  imageUrl?: string | null;
  quantity: number;
  originalPrice: number;
  unitPrice: number;
  discountPercent: number;
  promotionId?: number | null;
  lineTotal: number;
}

export interface CheckoutQuoteResponse {
  items: CheckoutQuoteItem[];
  originalSubtotal: number;
  productDiscountTotal: number;
  subtotalBeforeVoucher: number;
  voucherDiscountAmount: number;
  shippingFee: number;
  productRevenue: number;
  finalTotal: number;
  voucherCode?: string | null;
}

export const checkoutService = {
  quote: (data: any) => {
    return axiosClient.post<CheckoutQuoteResponse>("/v1/checkout/quote", data);
  },
};
