import { useEffect, useMemo, useState } from "react";
import {
  Tag,
  Space,
  Button,
  message,
  Tooltip,
  Popconfirm,
  Tabs,
  Table,
  Spin,
  Typography,
  Card,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Empty,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CarOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ProColumns } from "@ant-design/pro-table";
import { adminOrderService } from "@/services/admin.order.service";
import { useLocation, useNavigate } from "react-router-dom";
import OrderDetailModal from "@/layouts/components/OrderDetailModal";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Order {
  id: number;
  code: string;
  customer?: {
    userProfile?: {
      fullName?: string;
    };
  };
  customerName?: string;
  phone?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  fullAddress?: string;
  totalAmount: number;
  subtotalAmount?: number;
  discountAmount?: number;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  voucherCode?: string;
  discountPercent?: number;
  status: string;
  createdAt: string;
  orderType?: string | null;
}

const OrderManagementPage = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string | undefined>(
    undefined,
  );
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(
    () => new URLSearchParams(location.search).get("tab") || "PENDING",
    [location.search],
  );

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await adminOrderService.getAllOrders({
        page: 0,
        size: 1000,
      });
      setAllOrders(response.data.content || []);
    } catch (error) {
      message.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await adminOrderService.updateOrderStatus(orderId, status);
      message.success("Cập nhật trạng thái thành công");
      fetchAllOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const formatCurrency = (value?: number) =>
    `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

  const normalizeStatus = (status?: string) => {
    const raw = String(status ?? '').trim().toUpperCase();

    if (['DRAFT'].includes(raw)) return 'DRAFT';
    if (['PENDING', 'WAITING_CONFIRM'].includes(raw)) return 'PENDING';
    if (['CONFIRMED', 'PROCESSING'].includes(raw)) return 'CONFIRMED';
    if (['SHIPPING', 'DELIVERING'].includes(raw)) return 'SHIPPING';
    if (['COMPLETED', 'DONE', 'DELIVERED', 'SUCCESS'].includes(raw)) return 'COMPLETED';
    if (['CANCELLED', 'CANCELED'].includes(raw)) return 'CANCELLED';

    return raw;
  };

  const normalizeOrderType = (order: Order): 'POS' | 'ONLINE' => {
    const raw = String(order.orderType ?? '').trim().toUpperCase();

    if (['POS', 'OFFLINE', 'COUNTER', 'AT_COUNTER'].includes(raw)) {
      return 'POS';
    }

    if (['ONLINE', 'DELIVERY', 'WEB', 'ECOMMERCE'].includes(raw)) {
      return 'ONLINE';
    }

    const hasShippingAddress = Boolean(
      order.fullAddress ||
      order.address ||
      order.province ||
      order.district ||
      order.ward
    );

    if (hasShippingAddress) {
      return 'ONLINE';
    }

    return 'POS';
  };

  const getDisplayAddress = (order: Order) => {
    if (normalizeOrderType(order) === 'POS') {
      return 'Bán tại quầy';
    }

    if (order.fullAddress) {
      return order.fullAddress;
    }

    const parts = [order.address, order.ward, order.district, order.province]
      .filter(Boolean)
      .map((item) => String(item).trim());

    if (parts.length > 0) {
      return parts.join(', ');
    }

    return 'Chưa có địa chỉ';
  };

  const getStatusTag = (status: string) => {
    switch (normalizeStatus(status)) {
      case 'DRAFT':
        return <Tag color="default">Nháp</Tag>;
      case "PENDING":
        return <Tag color="gold">Chờ xác nhận</Tag>;
      case "CONFIRMED":
        return <Tag color="lime">Đã xác nhận</Tag>;
      case "SHIPPING":
        return <Tag color="blue">Đang giao hàng</Tag>;
      case "COMPLETED":
        return <Tag color="green">Hoàn thành</Tag>;
      case "CANCELLED":
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getOrderTypeTag = (order: Order) => {
    const type = normalizeOrderType(order);

    switch (type) {
      case 'POS':
        return <Tag color="blue">Tại quầy</Tag>;
      case "ONLINE":
        return <Tag color="geekblue">Online</Tag>;
      default:
        return <Tag color="geekblue">Online</Tag>;
    }
  };

  const normalizedKeyword = searchText.trim().toLowerCase();

  const baseFilteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const displayAddress = getDisplayAddress(order);

      const matchesKeyword =
        !normalizedKeyword ||
        [
          order.code,
          order.customerName,
          order.customer?.userProfile?.fullName,
          order.phone,
          order.fullAddress,
          order.address,
          order.province,
          order.district,
          order.ward,
          displayAddress,
          normalizeOrderType(order) === 'POS' ? 'bán tại quầy' : 'online',
          normalizeOrderType(order) === 'POS' ? 'tại quầy' : 'bán online',
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedKeyword),
          );

      const matchesOrderType =
        !orderTypeFilter || normalizeOrderType(order) === orderTypeFilter;

      const matchesDateRange = (() => {
        if (!dateRange || !dateRange[0] || !dateRange[1] || !order.createdAt) {
          return true;
        }

        const createdAt = dayjs(order.createdAt);
        return (
          (createdAt.isAfter(dateRange[0].startOf("day")) &&
            createdAt.isBefore(dateRange[1].endOf("day"))) ||
          createdAt.isSame(dateRange[0], "day") ||
          createdAt.isSame(dateRange[1], "day")
        );
      })();

      return matchesKeyword && matchesOrderType && matchesDateRange;
    });
  }, [allOrders, normalizedKeyword, orderTypeFilter, dateRange]);

  const resetFilters = () => {
    setSearchText("");
    setOrderTypeFilter(undefined);
    setDateRange(null);
  };

  const columns: ProColumns<Order>[] = [
    // {
    //   title: "STT",
    //   width: 64,
    //   search: false,
    //   align: "center",
    //   render: (text, record, index) => index + 1, 
    // },
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      render: (text) => <Text strong>#{text}</Text>,
      width: 150,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (_, record) =>
        record.customerName || record.customer?.userProfile?.fullName || "N/A",
      width: 160,
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
      render: (value) => value || "N/A",
      width: 110,
    },
    {
      title: "Địa chỉ nhận hàng",
      dataIndex: "fullAddress",
      key: "fullAddress",
      width: 200,
      render: (_, record) => {
        const displayAddress = getDisplayAddress(record);

        if (displayAddress === 'Bán tại quầy') {
          return <Text type="secondary">{displayAddress}</Text>;
        }

        if (displayAddress === 'Chưa có địa chỉ') {
          return <Text type="secondary">{displayAddress}</Text>;
        }

        return <Text>{displayAddress}</Text>;
      },
    },
    {
      title: "Mã giảm",
      dataIndex: "voucherCode",
      key: "voucherCode",
      width: 120,
      align: "center" as const, 
      render: (dom: React.ReactNode) => { 
        const code = dom as string | undefined; 
        if (!code) {
          return <Text type="secondary">Không có</Text>;
        }
        return <Tag color="green">{code}</Tag>;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      search: false,
      width: 140,
      render: (_, record: Order) => (
        <Text strong style={{ color: "#c81d1d" }}>
          {record.totalAmount?.toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      valueType: "dateTime",
      search: false,
      width: 140,
      render: (date: any) =>
        date ? new Date(date).toLocaleString("vi-VN") : "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: "Loại đơn hàng",
      dataIndex: "orderType",
      key: "orderType",
      width: 80,
      render: (_, record) => getOrderTypeTag(record),
    },
    {
      title: "Thao tác",
      valueType: "option",
      align: "center",
      fixed: "right",
      width: 110,
      render: (_, record) => [
        <Tooltip title="Xem chi tiết" key="view">
          <Button
            icon={<EyeOutlined />}
            shape="circle"
            type="text"
            size="large"
            onClick={() => {
              setSelectedOrderId(record.id);
              setIsModalVisible(true);
            }}
          />
        </Tooltip>,

        record.status === "PENDING" && (
          <Popconfirm
            key="confirm"
            title="Xác nhận đơn hàng này?"
            description="Đơn sẽ chuyển sang Đã xác nhận và hệ thống sẽ trừ tồn kho."
            onConfirm={() => handleUpdateStatus(record.id, "CONFIRMED")}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title="Xác nhận đơn hàng">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                shape="circle"
                size="large"
              />
            </Tooltip>
          </Popconfirm>
        ),

        record.status === "CONFIRMED" && (
          <Popconfirm
            key="ship"
            title="Xác nhận giao hàng?"
            description="Trạng thái sẽ chuyển sang Đang giao hàng."
            onConfirm={() => handleUpdateStatus(record.id, "SHIPPING")}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title="Giao hàng">
              <Button
                type="default"
                icon={<CarOutlined />}
                shape="circle"
                size="large"
              />
            </Tooltip>
          </Popconfirm>
        ),

        record.status === "SHIPPING" && (
          <Popconfirm
            key="complete"
            title="Hoàn thành đơn hàng?"
            onConfirm={() => handleUpdateStatus(record.id, "COMPLETED")}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Tooltip title="Hoàn thành">
              <Button
                icon={<CheckCircleOutlined />}
                shape="circle"
                size="large"
                style={{ color: "green", borderColor: "green" }}
              />
            </Tooltip>
          </Popconfirm>
        ),

      ],
    },
  ];

  const renderOrderTable = (orders: Order[]) => {
    if (!orders.length) {
      return (
        <Empty
          description="Không có hóa đơn phù hợp"
          style={{ padding: "24px 0" }}
        />
      );
    }

    return (
      <Table
        columns={columns as any}
        dataSource={orders}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1600 }}
      />
    );
  };

  const tabItems = [
    {
      key: "PENDING",
      label: `Chờ xác nhận (${baseFilteredOrders.filter((o) => o.status === "PENDING").length})`,
      children: renderOrderTable(
        baseFilteredOrders.filter((o) => o.status === "PENDING"),
      ),
    },
    {
      key: "CONFIRMED",
      label: `Đã xác nhận (${baseFilteredOrders.filter((o) => o.status === "CONFIRMED").length})`,
      children: renderOrderTable(
        baseFilteredOrders.filter((o) => o.status === "CONFIRMED"),
      ),
    },
    {
      key: "SHIPPING",
      label: `Đang giao (${baseFilteredOrders.filter((o) => o.status === "SHIPPING").length})`,
      children: renderOrderTable(
        baseFilteredOrders.filter((o) => o.status === "SHIPPING"),
      ),
    },
    {
      key: "COMPLETED",
      label: `Hoàn thành (${baseFilteredOrders.filter((o) => o.status === "COMPLETED").length})`,
      children: renderOrderTable(
        baseFilteredOrders.filter((o) => o.status === "COMPLETED"),
      ),
    },
    {
      key: "CANCELLED",
      label: `Đã hủy (${baseFilteredOrders.filter((o) => o.status === "CANCELLED").length})`,
      children: renderOrderTable(
        baseFilteredOrders.filter((o) => o.status === "CANCELLED"),
      ),
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        boxShadow: "0 6px 16px rgb(0 0 0 / 8%)",
        margin: "16px",
      }}
      bodyStyle={{ padding: 24 }}
      bordered={false}
      title={
        <Title level={3} style={{ margin: 0, color: "#0f172a" }}>
          Quản lý Đơn hàng / Hóa đơn
        </Title>
      }
    >
      <Spin spinning={loading}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={10}>
              <Input
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                placeholder="Tìm theo mã đơn, tên khách, số điện thoại, địa chỉ..."
              />
            </Col>

            <Col xs={24} md={5}>
              <Select
                allowClear
                value={orderTypeFilter}
                onChange={(value) => setOrderTypeFilter(value)}
                placeholder="Lọc theo loại đơn"
                style={{ width: "100%" }}
                options={[
                  { label: "Tại quầy", value: "POS" },
                  { label: "Online", value: "ONLINE" },
                ]}
              />
            </Col>

            <Col xs={24} md={7}>
              <RangePicker
                value={dateRange}
                onChange={(values) =>
                  setDateRange(values as [Dayjs | null, Dayjs | null] | null)
                }
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Col>

            <Col xs={24} md={2}>
              <Button icon={<ReloadOutlined />} onClick={resetFilters} block>
                Reset
              </Button>
            </Col>
          </Row>

          <Tabs
            defaultActiveKey="PENDING"
            activeKey={activeTab}
            items={tabItems}
            onChange={(key) => navigate(`/admin/orders?tab=${key}`)}
          />
        </Space>
      </Spin>

      <OrderDetailModal
        orderId={selectedOrderId}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </Card>
  );
};

export default OrderManagementPage;
