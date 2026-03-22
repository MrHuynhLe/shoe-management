import { axiosClient } from "./axiosClient";
import {
  OverviewStatistics,
  PageResponse,
  StatisticsQuery,
  TopProductItem,
} from "@/features/statistics/statistics.model";

const buildOverviewParams = (query?: StatisticsQuery) => {
  const params: Record<string, any> = {};

  if (query?.fromDate) params.fromDate = query.fromDate;
  if (query?.toDate) params.toDate = query.toDate;

  return params;
};

const buildTopProductParams = (query?: StatisticsQuery) => {
  const params: Record<string, any> = {};

  if (query?.fromDate) params.fromDate = query.fromDate;
  if (query?.toDate) params.toDate = query.toDate;

  params.page = Number.isFinite(Number(query?.page)) ? Number(query?.page) : 0;
  params.size = Number.isFinite(Number(query?.size)) ? Number(query?.size) : 10;

  return params;
};

export const statisticsService = {
  getOverview: async (query?: StatisticsQuery): Promise<OverviewStatistics> => {
    const res = await axiosClient.get("/v1/statistics/overview", {
      params: buildOverviewParams(query),
    });
    return res.data;
  },

  getTopProducts: async (
    query?: StatisticsQuery,
  ): Promise<PageResponse<TopProductItem>> => {
    const res = await axiosClient.get("/v1/statistics/top-products", {
      params: buildTopProductParams(query),
    });
    return res.data;
  },

  exportTopProductsExcel: (params?: any) =>
    axiosClient.get("/v1/statistics/export/excel/top-products", {
      params,
      responseType: "blob",
    }),

  exportTopProductsPdf: (params?: any) =>
    axiosClient.get("/v1/statistics/export/pdf/top-products", {
      params,
      responseType: "blob",
    }),
};
