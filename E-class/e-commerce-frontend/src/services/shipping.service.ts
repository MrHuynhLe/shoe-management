import { axiosClient } from './axiosClient';

interface ShippingInfo {
  province: string;
  district: string;
  address: string;
}

interface ShippingItem {
  variantId: number;
  quantity: number;
}

interface ShippingEstimateRequest {
  shippingInfo: ShippingInfo;
  items: ShippingItem[];
}

export const shippingService = {
  estimateShippingFee: (request: ShippingEstimateRequest) => {
    return axiosClient.post('/v1/shipping/estimate', request);
  },
};