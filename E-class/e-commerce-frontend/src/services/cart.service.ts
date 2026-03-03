import { axiosClient } from './axiosClient';

export interface AddToCartDTO {
  variantId: number;
  quantity: number;
}

export const cartService = {
  getCart: (customerId: number) => axiosClient.get(`/v1/cart/${customerId}`),

  addToCart: (data: AddToCartDTO) => axiosClient.post('/v1/cart/items', data),

  updateItemQuantity: (cartItemId: number, quantity: number) =>
    axiosClient.put(`/v1/cart/items/${cartItemId}`, null, {
      params: { quantity },
    }),

  removeItem: (cartItemId: number) => axiosClient.delete(`/v1/cart/items/${cartItemId}`),

  clearCart: (customerId: number) => axiosClient.delete(`/v1/cart/${customerId}`),

  checkout: (customerId: number) => axiosClient.post(`/v1/cart/checkout/${customerId}`),
};