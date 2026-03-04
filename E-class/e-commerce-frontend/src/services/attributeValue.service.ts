import { axiosClient } from "./axiosClient";
import type { AttributeValue, AttributeValueRequest } from "@/features/attribute/attributeValue.model";

export const attributeValueService = {
  getByCode: async (code: string): Promise<AttributeValue[]> => {
    const res = await axiosClient.get<AttributeValue[]>(`/v1/attributes/${code}/values`);
    return res.data;
  },

  createByCode: async (code: string, payload: AttributeValueRequest): Promise<AttributeValue> => {
    const res = await axiosClient.post<AttributeValue>(`/v1/attributes/${code}/values`, payload);
    return res.data;
  },

  update: async (id: number, payload: AttributeValueRequest): Promise<AttributeValue> => {
    const res = await axiosClient.put<AttributeValue>(`/v1/attribute-values/${id}`, payload);
    return res.data;
  },

  disable: async (id: number): Promise<void> => {
    await axiosClient.delete(`/v1/attribute-values/${id}`);
  },
};