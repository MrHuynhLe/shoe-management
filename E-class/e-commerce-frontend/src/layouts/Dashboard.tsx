import React, { useState, useEffect } from "react";
import {
  Card, Col, Row, Space, Statistic, Typography, Table, List, Avatar, Tag, Spin, message, ConfigProvider
} from "antd";
import antdViVN from "antd/locale/vi_VN";
import {
  ShoppingCartOutlined, DollarCircleOutlined, RiseOutlined, ShoppingOutlined
} from "@ant-design/icons";
import { Line, Pie } from "@ant-design/charts";

const { Title, Text } = Typography;

interface RevenueData {
  date: string;
  value: number;
}

interface OrderStatusData {
  type: string;
  value: number;
}

interface TopProduct {
  id: number;
  name: string;
  sold: number;
  image: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
}

const mockRevenueData: RevenueData[] = [
  { date: "Ngày 1", value: 12_000_000 },
  { date: "Ngày 2", value: 15_500_000 },
  { date: "Ngày 3", value: 11_000_000 },
  { date: "Ngày 4", value: 18_200_000 },
  { date: "Ngày 5", value: 16_000_000 },
  { date: "Ngày 6", value: 22_500_000 },
  { date: "Ngày 7", value: 20_000_000 },
];

const mockOrderStatusData: OrderStatusData[] = [
  { type: "Hoàn thành", value: 275 },
  { type: "Đang giao", value: 45 },
  { type: "Chờ xác nhận", value: 18 },
  { type: "Đã hủy", value: 15 },
];

const mockTopProductsData: TopProduct[] = [
  {
    id: 1,
    name: "Nike Air Force 1 07",
    sold: 152,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200",
  },
  {
    id: 2,
    name: "Adidas Ultraboost Light",
    sold: 121,
    image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=200",
  },
  {
    id: 3,
    name: "Jordan Low Retro",
    sold: 98,
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=200",
  },
  {
    id: 4,
    name: "Converse Chuck 70",
    sold: 85,
    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a90a5?q=80&w=200",
  },
];

const mockRecentOrdersData: RecentOrder[] = [
  {
    id: "DH-00125",
    customer: "Nguyễn Văn An",
    total: 2200000,
    status: "PENDING",
  },
  {
    id: "DH-00124",
    customer: "Trần Thị Bích",
    total: 3150000,
    status: "COMPLETED",
  },
  {
    id: "DH-00123",
    customer: "Lê Văn Cường",
    total: 4200000,
    status: "SHIPPING",
  },
  {
    id: "DH-00122",
    customer: "Phạm Thị Duyên",
    total: 850000,
    status: "CANCELLED",
  },
];

const getStatusTag = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <Tag color="green">Hoàn thành</Tag>;
    case "PENDING":
      return <Tag color="orange">Chờ xác nhận</Tag>;
    case "SHIPPING":
      return <Tag color="blue">Đang giao</Tag>;
    case "CANCELLED":
      return <Tag color="red">Đã hủy</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [profit, setProfit] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [productsSold, setProductsSold] = useState(0);
  const [revenueChartData, setRevenueChartData] = useState<RevenueData[]>([]);
  const [orderStatusChartData, setOrderStatusChartData] = useState<OrderStatusData[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 500));
      try {

        setTotalRevenue(112893000);
        setProfit(45300000);
        setTotalOrders(353);
        setProductsSold(1245);
        setRevenueChartData(mockRevenueData);
        setOrderStatusChartData(mockOrderStatusData);
        setTopSellingProducts(mockTopProductsData);
        setRecentOrders(mockRecentOrdersData);
      } catch (error) {
        message.error("Không thể tải dữ liệu Dashboard.");
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ConfigProvider locale={antdViVN}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>Tổng quan</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Spin spinning={loading}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={totalRevenue}
                  precision={0}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<DollarCircleOutlined />}
                  suffix="₫"
                />
              </Card>
            </Spin>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Spin spinning={loading}>
              <Card>
                <Statistic
                  title="Lợi nhuận"
                  value={profit}
                  precision={0}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<RiseOutlined />}
                  suffix="₫"
                />
              </Card>
            </Spin>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Spin spinning={loading}>
              <Card>
                <Statistic
                  title="Tổng đơn hàng"
                  value={totalOrders}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </Spin>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Spin spinning={loading}>
              <Card>
                <Statistic
                  title="Sản phẩm đã bán"
                  value={productsSold}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Spin>
          </Col>
        </Row>


        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="Doanh thu 7 ngày gần nhất">
              <Spin spinning={loading}>
                <Line data={revenueChartData} xField="date" yField="value" height={300} />
              </Spin>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Tỷ lệ trạng thái đơn hàng">
              <Spin spinning={loading}>
                <Pie
                  data={orderStatusChartData}
                  angleField="value"
                  colorField="type"
                  radius={0.8}
                  height={300}
                  label={{
                    type: "inner",
                    offset: "-50%",
                    content: ({ percent }: { percent: number }) =>
                      `${(percent * 100).toFixed(0)}%`,
                    style: {
                      textAlign: "center",
                      fontSize: 14,
                    },
                  }}
                />
              </Spin>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Top sản phẩm bán chạy">
              <Spin spinning={loading}>
                <List
                  itemLayout="horizontal"
                  dataSource={topSellingProducts}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={item.image} />}
                        title={<a href="#">{item.name}</a>}
                        description={`Đã bán: ${item.sold}`}
                      />
                      <div>
                        <Text strong>#{index + 1}</Text>
                      </div>
                    </List.Item>
                  )}
                />
              </Spin>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Đơn hàng gần đây">
              <Spin spinning={loading}>
                <Table
                  dataSource={recentOrders}
                  pagination={false}
                  rowKey="id"
                  columns={[
                    { title: "Mã ĐH", dataIndex: "id" },
                    { title: "Khách hàng", dataIndex: "customer" },
                    {
                      title: "Tổng tiền",
                      dataIndex: "total",
                      render: (val) => val.toLocaleString("vi-VN") + " ₫",
                    },
                    {
                      title: "Trạng thái",
                      dataIndex: "status",
                      render: getStatusTag,
                    },
                  ]}
                />
              </Spin>
            </Card>
          </Col>
        </Row>
      </Space>
    </ConfigProvider>
  );
};
export default DashboardPage;