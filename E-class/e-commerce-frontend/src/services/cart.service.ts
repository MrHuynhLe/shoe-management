import { axiosClient } from './axiosClient';

export interface AddToCartDTO {
  productVariantId: number;
  quantity: number;
}

export const cartService = {

  getCart: () => {
    return axiosClient.get('/v1/cart');
  },


  addToCart: (data: AddToCartDTO) => {
    return axiosClient.post('/v1/cart/items', data);
  },

  updateItemQuantity: (cartItemId: number, quantity: number) => {
    return axiosClient.put(`/v1/cart/items/${cartItemId}`, null, { params: { quantity } });
  },


  removeItem: (cartItemId: number) => {
    return axiosClient.delete(`/v1/cart/items/${cartItemId}`);
  },

  clearCart: () => {
    return axiosClient.delete('/v1/cart');
  },

  checkout: () => {
    return axiosClient.post('/v1/cart/checkout');
  },
};