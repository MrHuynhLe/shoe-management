import { axiosClient } from "./axiosClient";

export const productService = {
  getProducts: (page = 0, size = 12) =>
    axiosClient.get("/v1/products", {
      params: { page, size },
    }),

  getProductById: (productId: number) =>
    axiosClient.get(`/v1/products/${productId}`),

  getBrands: () => axiosClient.get('/v1/brands'),
  getCategories: () => axiosClient.get('/v1/categories'),
  getOrigins: () => axiosClient.get('/v1/origins'),
  getSuppliers: () => axiosClient.get('/v1/suppliers'),
  getAttributes: () => axiosClient.get('/v1/attributes'),

  createProduct: (productData: FormData) =>
    axiosClient.post("/v1/products", productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  uploadImage: (formData: FormData) =>
    axiosClient.post("/v1/products/upload-image", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),


  bulkCreateVariantsOnly: (payload: { productId: number | null; variants: any[] }) => {
    return axiosClient.post('/v1/variants/bulk', payload, {
      headers: {
        'Content-Type': 'application/json', 
      },
    });
  },
  bulkCreateVariants: (productId: number, variants: any[]) => {
    const formData = new FormData();
    const variantsJson = variants.map(variant => {
      const { variantImages, ...rest } = variant;
      return rest;
    });

    formData.append('data', new Blob([JSON.stringify({ productId, variants: variantsJson })], { type: 'application/json' }));

    variants.forEach((variant) => {
      if (variant.variantImages && variant.variantImages.length > 0 && variant.variantImages[0].originFileObj) {
        formData.append(`images`, variant.variantImages[0].originFileObj);
      }
    });

    return axiosClient.post('/v1/variants/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};