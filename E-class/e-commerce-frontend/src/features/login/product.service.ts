// import apiClient from '@/services/api';

// const getProducts = (page: number, size: number) => {
//   return apiClient.get(`/v1/products?page=${page}&size=${size}`);
// };

// const createProduct = (formData: FormData) => {
//   return apiClient.post('/v1/products', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
// };

// const bulkCreateVariants = (productId: number, variants: any[]) => {
//   return apiClient.post(`/v1/products/${productId}/variants/bulk`, variants);
// };

// const getProductById = (productId: number) => {
//   return apiClient.get(`/v1/products/${productId}`);
// };

// const getAttributes = () => {
//   return apiClient.get('/v1/attributes/all');
// };

// const uploadImage = (formData: FormData) => {
//   return apiClient.post('/v1/images/upload', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
// };

// const bulkCreateVariantsOnly = (data: { productId: number; variants: any[] }) => {
//   return apiClient.post(`/v1/products/${data.productId}/variants/bulk`, data.variants);
// };

// export const productService = {
//   getProducts,
//   createProduct,
//   bulkCreateVariants,
//   getProductById,
//   getAttributes,
//   uploadImage,
//   bulkCreateVariantsOnly,
// };