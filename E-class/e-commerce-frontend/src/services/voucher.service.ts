import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const voucherService = {
  getAll: (page = 0, size = 10, sortBy = "id", sortDir = "desc") =>
    api.get("/v1/promotions", { params: { page, size, sortBy, sortDir } }),

  getActive: () => api.get("/v1/promotions/active"),

  getCurrent: () => api.get("/v1/promotions/current"),

  getById: (id: number) => api.get(`/v1/promotions/${id}`),

  getByCode: (code: string) => api.get(`/v1/promotions/code/${code}`),

  create: (data: {
    code: string;
    name: string;
    description?: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number;
    maxUsage?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) => api.post("/v1/promotions", data),

  update: (id: number, data: {
    code: string;
    name: string;
    description?: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number;
    maxUsage?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) => api.put(`/v1/promotions/${id}`, data),

  delete: (id: number) => api.delete(`/v1/promotions/${id}`),

  apply: (code: string, orderAmount: number) =>
    api.post("/v1/promotions/apply", { code, orderAmount }),
};
