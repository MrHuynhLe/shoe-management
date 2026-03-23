export interface StatisticsQuery {
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}

export interface OverviewStatistics {
  totalRevenue: number;
  totalOrders: number;
  totalProductsSold: number;
  totalCustomers: number;
}

export interface TopProductItem {
  productId: number;
  productCode: string;
  productName: string;
  brandName: string;
  categoryName: string;
  totalSold: number;
  revenue: number;
  profit: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}