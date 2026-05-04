import { axiosClient } from "./axiosClient";
import {
  OrderStatusItem,
  OverviewStatistics,
  PageResponse,
  PaymentMethodRevenueItem,
  RevenueChartItem,
  StatisticsQuery,
  TopProductItem,
} from "@/features/statistics/statistics.model";

const buildCommonParams = (query?: StatisticsQuery) => {
  const params: Record<string, any> = {};

  if (query?.from) params.from = query.from;
  if (query?.to) params.to = query.to;

  // ALL = lấy cả POS + ONLINE
  // POS = chỉ bán tại quầy
  // ONLINE = chỉ đơn online
  if (query?.orderType) {
    params.orderType = query.orderType;
  }

  return params;
};
const buildTopProductParams = (query?: StatisticsQuery) => {
  const params = buildCommonParams(query);
  params.page = Number.isFinite(Number(query?.page)) ? Number(query?.page) : 0;
  params.size = Number.isFinite(Number(query?.size)) ? Number(query?.size) : 10;
  return params;
};

const buildRevenueParams = (
  groupBy: "day" | "week" | "month",
  query?: StatisticsQuery,
) => {
  const params = buildCommonParams(query);
  params.groupBy = groupBy;
  return params;
};

export const statisticsService = {
  getOverview: async (query?: StatisticsQuery): Promise<OverviewStatistics> => {
    const res = await axiosClient.get("/v1/statistics/overview", {
      params: buildCommonParams(query),
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

  getOrderStatus: async (query?: StatisticsQuery): Promise<OrderStatusItem[]> => {
    const res = await axiosClient.get("/v1/statistics/order-status", {
      params: buildCommonParams(query),
    });
    return res.data;
  },

  getPaymentMethodRevenue: async (
    query?: StatisticsQuery,
  ): Promise<PaymentMethodRevenueItem[]> => {
    const res = await axiosClient.get("/v1/statistics/payment-methods", {
      params: buildCommonParams(query),
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