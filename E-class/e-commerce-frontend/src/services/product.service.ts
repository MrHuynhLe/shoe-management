import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const productService = {
  getProducts: (page = 0, size = 12) =>
    api.get("/v1/products", {
      params: { page, size },
    }),
  getProductById: (productId: number) =>
    api.get(`/v1/products/${productId}`),
};
