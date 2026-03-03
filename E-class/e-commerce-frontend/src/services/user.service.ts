import { axiosClient } from "./axiosClient";

export const userService = {
  getUsers: (page: number, size: number, keyword?: string) =>
    axiosClient.get("/v1/users", {
      params: { page, size, keyword },
    }),

  createUser: (data: any) =>
    axiosClient.post("/v1/users", data),

  updateUser: (id: number, data: any) =>
    axiosClient.put(`/v1/users/${id}`, data),

  updateStatus: (id: number, isActive: boolean) =>
    axiosClient.patch(`/v1/users/${id}/status`, { isActive }),

  deleteUser: (id: number) =>
    axiosClient.delete(`/v1/users/${id}`),

  restoreUser: (id: number) =>
    axiosClient.patch(`/v1/users/${id}/restore`),

  getUserById: (id: number) =>
    axiosClient.get(`/v1/users/${id}`),

  getRoles: () =>
    axiosClient.get("/v1/roles"),
};