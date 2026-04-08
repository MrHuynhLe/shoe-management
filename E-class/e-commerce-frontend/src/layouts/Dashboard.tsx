import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Typography,
  message,
} from "antd";
import {
  DollarCircleOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { statisticsService } from "@/services/statistics.service";
import {
  OrderStatusItem,
  OverviewStatistics,
  PageResponse,
  PaymentMethodRevenueItem,
  RevenueChartItem,
  StatisticsQuery,
  TopProductItem,
} from "@/features/statistics/statistics.model";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [query, setQuery] = useState<StatisticsQuery>({
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().endOf("day").format("YYYY-MM-DD"),
  });

  const [overview, setOverview] = useState<OverviewStatistics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProductsSold: 0,
    totalCustomers: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueChartItem[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusItem[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<
    PaymentMethodRevenueItem[]
  >([]);
  const [topProducts, setTopProducts] = useState<PageResponse<TopProductItem>>({
    content: [],
    page: 0,
    size: 5,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  const fetchDashboardData = async (
    customQuery = query,
    customGroupBy: "day" | "week" | "month" = groupBy,
  ) => {
    try {
      setLoading(true);

      const [
        overviewRes,
        revenueRes,
        orderStatusRes,
        paymentMethodRes,
        topProductsRes,
      ] = await Promise.all([
        statisticsService.getOverview(customQuery),
        statisticsService.getRevenue(customGroupBy, customQuery),
        statisticsService.getOrderStatus(customQuery),
        statisticsService.getPaymentMethodRevenue(customQuery),
        statisticsService.getTopProducts({ ...customQuery, page: 0, size: 5 }),
      ]);

      setOverview(
        overviewRes ?? {
          totalRevenue: 0,
          totalOrders: 0,
          totalProductsSold: 0,
          totalCustomers: 0,
        },
      );
      setRevenueData(Array.isArray(revenueRes) ? revenueRes : []);
      setOrderStatusData(Array.isArray(orderStatusRes) ? orderStatusRes : []);
      setPaymentMethodData(
        Array.isArray(paymentMethodRes) ? paymentMethodRes : [],
      );
      setTopProducts(
        topProductsRes ?? {
          content: [],
          page: 0,
          size: 5,
          totalElements: 0,
          totalPages: 0,
          last: true,
        },
      );
    } catch (error) {
      console.error("fetchDashboardData error", error);
      message.error("Không tải được dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchDashboardData(query, groupBy);
  }, [groupBy]);

  const handleApplyFilter = (range: any) => {
    const nextQuery: StatisticsQuery = {
      from: range?.[0] ? dayjs(range[0]).format("YYYY-MM-DD") : undefined,
      to: range?.[1] ? dayjs(range[1]).format("YYYY-MM-DD") : undefined,
    };

    setQuery(nextQuery);
    fetchDashboardData(nextQuery, groupBy);
  };

  const applyPreset = (preset: "today" | "week" | "month") => {
    let from = dayjs();
    let to = dayjs();

    if (preset === "today") {
      from = dayjs().startOf("day");
      to = dayjs().endOf("day");
      setGroupBy("day");
    }

    if (preset === "week") {
      from = dayjs().startOf("week");
      to = dayjs().endOf("day");
      setGroupBy("week");
    }

    if (preset === "month") {
      from = dayjs().startOf("month");
      to = dayjs().endOf("day");
      setGroupBy("month");
    }

    const nextQuery: StatisticsQuery = {
      from: from.format("YYYY-MM-DD"),
      to: to.format("YYYY-MM-DD"),
    };

    setQuery(nextQuery);
    fetchDashboardData(nextQuery, preset === "today" ? "day" : preset);
  };

  const formatCurrency = (value: number) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} đ`;

  const mapStatusLabel = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "SHIPPING":
        return "Đang giao";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status || "Khác";
    }
  };

  const shortPaymentName = (item: PaymentMethodRevenueItem) => {
    const code = String(item.paymentMethodCode || "").toUpperCase();
    const name = String(item.paymentMethodName || "");

    if (code.includes("CASH") || name.toLowerCase().includes("tiền mặt")) {
      return "Tiền mặt";
    }

    if (
      code.includes("TRANSFER") ||
      code.includes("BANK") ||
      name.toLowerCase().includes("chuyển khoản")
    ) {
      return "Chuyển khoản";
    }

    return name || "Khác";
  };

  const PIE_COLORS = [
    "#1677ff",
    "#52c41a",
    "#faad14",
    "#ff4d4f",
    "#722ed1",
    "#13c2c2",
    "#eb2f96",
    "#fa8c16",
    "#2f54eb",
    "#a0d911",
  ];

  const revenuePieData = revenueData
    .map((item) => ({
      name:
        groupBy === "day"
          ? dayjs(item.label).format("DD/MM")
          : groupBy === "week"
            ? `Tuần ${dayjs(item.label).format("DD/MM")}`
            : dayjs(`${item.label}-01`).format("MM/YYYY"),
      value: Number(item.revenue || 0),
    }))
    .filter((item) => item.value > 0);

  const orderStatusPieData = orderStatusData
    .map((item) => ({
      name: mapStatusLabel(item.status),
      value: Number(item.totalOrders || 0),
    }))
    .filter((item) => item.value > 0);

  const paymentPieData = paymentMethodData
    .map((item) => ({
      name: shortPaymentName(item),
      value: Number(item.revenue || 0),
    }))
    .filter((item) => item.value > 0);

  const renderPieChart = (
  data: { name: string; value: number }[],
  emptyText: string,
  valueFormatter: (value: number) => string = (value) => String(value),
) => {
  if (!data.length) {
    return <Empty description={emptyText} />;
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={95}
            label={({ name, percent }: any) =>
              `${name}: ${((percent || 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: any, name: any) => [
              valueFormatter(Number(value || 0)),
              String(name || ""),
            ]}
          />

          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

  const cashRevenue = useMemo(
    () =>
      paymentMethodData
        .filter((item) => shortPaymentName(item) === "Tiền mặt")
        .reduce((sum, item) => sum + Number(item.revenue || 0), 0),
    [paymentMethodData],
  );

  const transferRevenue = useMemo(
    () =>
      paymentMethodData
        .filter((item) => shortPaymentName(item) === "Chuyển khoản")
        .reduce((sum, item) => sum + Number(item.revenue || 0), 0),
    [paymentMethodData],
  );

  const topProductColumns = [
    {
      title: "Top",
      key: "index",
      width: 70,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mã SP",
      dataIndex: "productCode",
      key: "productCode",
      render: (value: string) => value || "-",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (value: string) => value || "-",
    },
    {
      title: "SL bán",
      dataIndex: "totalSold",
      key: "totalSold",
      align: "right" as const,
      render: (value: number) => Number(value || 0),
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right" as const,
      render: (value: number) => formatCurrency(Number(value || 0)),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Title level={2} style={{ marginBottom: 8 }}>
          Tổng quan
        </Title>
        <Text type="secondary">
          Doanh thu đang được tính theo tiền hàng thực thu, không cộng phí ship.
        </Text>
      </div>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space wrap>
            <RangePicker
              value={
                query.from && query.to
                  ? [dayjs(query.from), dayjs(query.to)]
                  : undefined
              }
              format="DD/MM/YYYY"
              onChange={(value) => handleApplyFilter(value)}
            />
            <Button onClick={() => applyPreset("today")}>Hôm nay</Button>
            <Button onClick={() => applyPreset("week")}>Tuần này</Button>
            <Button onClick={() => applyPreset("month")}>Tháng này</Button>
          </Space>

          <Space wrap>
            <Button
              type={groupBy === "day" ? "primary" : "default"}
              onClick={() => setGroupBy("day")}
            >
              Theo ngày
            </Button>
            <Button
              type={groupBy === "week" ? "primary" : "default"}
              onClick={() => setGroupBy("week")}
            >
              Theo tuần
            </Button>
            <Button
              type={groupBy === "month" ? "primary" : "default"}
              onClick={() => setGroupBy("month")}
            >
              Theo tháng
            </Button>
          </Space>
        </Space>
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={Number(overview.totalRevenue || 0)}
                formatter={(value) => formatCurrency(Number(value || 0))}
                prefix={<DollarCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic
                title="Doanh thu tiền mặt"
                value={cashRevenue}
                formatter={(value) => formatCurrency(Number(value || 0))}
                prefix={<SwapOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic
                title="Doanh thu chuyển khoản"
                value={transferRevenue}
                formatter={(value) => formatCurrency(Number(value || 0))}
                prefix={<SwapOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic
                title="Sản phẩm đã bán"
                value={Number(overview.totalProductsSold || 0)}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic
                title="Tổng đơn hàng"
                value={Number(overview.totalOrders || 0)}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic
                title="Khách hàng mua hàng"
                value={Number(overview.totalCustomers || 0)}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          <Col xs={24} xl={14}>
            <Card title="Tỷ trọng doanh thu">
              {renderPieChart(
                revenuePieData,
                "Không có dữ liệu tỷ trọng doanh thu",
                formatCurrency,
              )}
            </Card>
          </Col>

          <Col xs={24} md={12} xl={5}>
            <Card title="Trạng thái đơn hàng">
              {renderPieChart(
                orderStatusPieData,
                "Chưa có dữ liệu trạng thái đơn",
                (value) => `${value} đơn`,
              )}
            </Card>
          </Col>

          <Col xs={24} md={12} xl={5}>
            <Card title="Tỷ trọng theo thanh toán">
              {renderPieChart(
                paymentPieData,
                "Chưa có dữ liệu thanh toán",
                formatCurrency,
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          <Col xs={24} xl={14}>
            <Card title="Top sản phẩm bán chạy">
              <Table
                rowKey="productId"
                dataSource={topProducts.content}
                columns={topProductColumns}
                pagination={false}
                scroll={{ x: 800 }}
                locale={{ emptyText: "Không có dữ liệu sản phẩm bán chạy" }}
              />
            </Card>
          </Col>

          <Col xs={24} xl={10}>
            <Card title="Doanh thu theo phương thức thanh toán">
              <Table
                rowKey={(record) =>
                  `${record.paymentMethodCode}-${record.paymentMethodName}`
                }
                dataSource={paymentMethodData}
                pagination={false}
                columns={[
                  {
                    title: "Phương thức",
                    dataIndex: "paymentMethodName",
                    key: "paymentMethodName",
                    render: (_: string, record: PaymentMethodRevenueItem) =>
                      shortPaymentName(record),
                  },
                  {
                    title: "Số đơn",
                    dataIndex: "totalOrders",
                    key: "totalOrders",
                    align: "right",
                  },
                  {
                    title: "Doanh thu",
                    dataIndex: "revenue",
                    key: "revenue",
                    align: "right",
                    render: (value: number) =>
                      formatCurrency(Number(value || 0)),
                  },
                ]}
                locale={{ emptyText: "Không có dữ liệu thanh toán" }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </Space>
  );
};

export default DashboardPage;
