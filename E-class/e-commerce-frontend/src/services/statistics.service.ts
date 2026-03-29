import { axiosClient } from "./axiosClient";
import {
  OverviewStatistics,
  PageResponse,
  RevenueChartItem,
  StatisticsQuery,
  TopProductItem,
} from "@/features/statistics/statistics.model";

const buildOverviewParams = (query?: StatisticsQuery) => {
  const params: Record<string, any> = {};

  if (query?.from) params.from = query.from;
  if (query?.to) params.to = query.to;

  return params;
};

const buildTopProductParams = (query?: StatisticsQuery) => {
  const params: Record<string, any> = {};

  if (query?.from) params.from = query.from;
  if (query?.to) params.to = query.to;

  params.page = Number.isFinite(Number(query?.page)) ? Number(query?.page) : 0;
  params.size = Number.isFinite(Number(query?.size)) ? Number(query?.size) : 10;

  return params;
};

const buildRevenueParams = (
  groupBy: "day" | "week" | "month",
  query?: StatisticsQuery,
) => {
  const params: Record<string, any> = { groupBy };

  if (query?.from) params.from = query.from;
  if (query?.to) params.to = query.to;

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

  getRevenue: async (
    groupBy: "day" | "week" | "month",
    query?: StatisticsQuery,
  ): Promise<RevenueChartItem[]> => {
    const res = await axiosClient.get("/v1/statistics/revenue", {
      params: buildRevenueParams(groupBy, query),
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