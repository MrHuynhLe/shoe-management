export interface StatisticsQuery {
  from?: string;
  to?: string;
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

export interface RevenueChartItem {
  label: string;
  totalOrders: number;
  revenue: number;
  itemsSold: number;
  profit: number;
}

export interface OrderStatusItem {
  status: string;
  totalOrders: number;
  totalAmount: number;
}


export interface PaymentMethodRevenueItem {
  paymentMethodCode: string;
  paymentMethodName: string;
  totalOrders: number;
  revenue: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}