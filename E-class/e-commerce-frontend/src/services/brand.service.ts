

import { Brand } from "@/features/brand/brand.model"
import { axiosClient } from "./axiosClient"

export const brandService = {
  getAll() {
    return axiosClient.get<Brand[]>("/v1/brands")
  },

  create(data: { name: string }) {
    return axiosClient.post("/v1/brands", data)
  },

  update(id: number, data: Partial<Brand>) {
    return axiosClient.put(`/v1/brands/${id}`, data)
  },

  remove(id: number) {
    return axiosClient.delete(`/v1/brands/${id}`)
  }
}