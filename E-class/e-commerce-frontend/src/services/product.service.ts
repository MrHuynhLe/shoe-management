import { axiosClient } from "./axiosClient";

export const productService = {
  getProducts: (params?: any) => {
    return axiosClient.get("/v1/products", { params });
  },

  getProductById: (productId: number) =>
    axiosClient.get(`/v1/products/${productId}`),

  getBrands: () => axiosClient.get("/v1/brands"),
  getCategories: () => axiosClient.get("/v1/categories"),
  getOrigins: () => axiosClient.get("/v1/origins"),
  getSuppliers: () => axiosClient.get("/v1/suppliers"),
  getAttributes: () => axiosClient.get("/v1/attributes"),

  getColors: () => axiosClient.get("/v1/attributes/color/values"),
  getSizes: () => axiosClient.get("/v1/attributes/size/values"),
  getMaterials: () => axiosClient.get("/v1/attributes/material/values"),

  createProductWithImages: (formData: FormData) =>
    axiosClient.post("/v1/products/with-images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  uploadImage: (formData: FormData) =>
    axiosClient.post("/v1/products/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  bulkCreateVariantsOnly: (payload: { productId: number; variants: any[] }) =>
    axiosClient.post("/v1/product-variants/bulk", payload),

  bulkCreateVariants: (productId: number, variants: any[]) => {
    const formData = new FormData();

    const variantsJson = variants.map((variant) => {
      const { variantImages, ...rest } = variant;
      return rest;
    });

    formData.append(
      "data",
      new Blob([JSON.stringify({ productId, variants: variantsJson })], {
        type: "application/json",
      }),
    );

    variants.forEach((variant) => {
      if (
        variant.variantImages &&
        variant.variantImages.length > 0 &&
        variant.variantImages[0].originFileObj
      ) {
        formData.append("images", variant.variantImages[0].originFileObj);
      }
    });

    return axiosClient.post("/v1/product-variants/bulk", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteProduct: (productId: number) => {
    return axiosClient.delete(`/v1/products/${productId}`);
  },

  deleteVariant: (variantId: number) => {
    return axiosClient.delete(`/v1/product-variants/${variantId}`);
  },
};