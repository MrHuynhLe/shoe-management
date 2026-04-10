import { useEffect, useMemo, useState } from 'react';
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
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CarOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import { adminOrderService } from '@/services/admin.order.service';
import { useLocation, useNavigate } from 'react-router-dom';
import OrderDetailModal from '@/layouts/components/OrderDetailModal';
import dayjs, { Dayjs } from 'dayjs';

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
  const [searchText, setSearchText] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(
    () => new URLSearchParams(location.search).get('tab') || 'PENDING',
    [location.search]
  );

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await adminOrderService.getAllOrders({ page: 0, size: 1000 });
      setAllOrders(response.data.content || []);
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng.');
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
      message.success('Cập nhật trạng thái thành công');
      fetchAllOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Tag color="default">Nháp</Tag>;
      case 'PENDING':
        return <Tag color="gold">Chờ xác nhận</Tag>;
      case 'CONFIRMED':
        return <Tag color="lime">Đã xác nhận</Tag>;
      case 'SHIPPING':
        return <Tag color="blue">Đang giao hàng</Tag>;
      case 'COMPLETED':
        return <Tag color="green">Hoàn thành</Tag>;
      case 'CANCELLED':
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getOrderTypeTag = (orderType?: string | null) => {
    switch (orderType) {
      case 'POS':
        return <Tag color="blue">Tại quầy</Tag>;
      case 'ONLINE':
        return <Tag color="geekblue">Online</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  const normalizedKeyword = searchText.trim().toLowerCase();

  const baseFilteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [
          order.code,
          order.customerName,
          order.customer?.userProfile?.fullName,
          order.phone,
          order.fullAddress,
          order.address,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedKeyword));

      const matchesOrderType = !orderTypeFilter || order.orderType === orderTypeFilter;

      const matchesDateRange = (() => {
        if (!dateRange || !dateRange[0] || !dateRange[1] || !order.createdAt) {
          return true;
        }

        const createdAt = dayjs(order.createdAt);
        return (
          createdAt.isAfter(dateRange[0].startOf('day')) &&
          createdAt.isBefore(dateRange[1].endOf('day'))
        ) || createdAt.isSame(dateRange[0], 'day') || createdAt.isSame(dateRange[1], 'day');
      })();

      return matchesKeyword && matchesOrderType && matchesDateRange;
    });
  }, [allOrders, normalizedKeyword, orderTypeFilter, dateRange]);

  const resetFilters = () => {
    setSearchText('');
    setOrderTypeFilter(undefined);
    setDateRange(null);
  };

  const columns: ProColumns<Order>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      render: (text) => <Text strong>#{text}</Text>,
      width: 160,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (_, record) =>
        record.customerName || record.customer?.userProfile?.fullName || 'N/A',
      width: 180,
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      render: (value) => value || 'N/A',
      width: 130,
    },
    {
      title: 'Địa chỉ nhận hàng',
      dataIndex: 'fullAddress',
      key: 'fullAddress',
      width: 320,
      render: (_, record) => {
        if (record.orderType === 'POS') {
          return <Text type="secondary">Bán tại quầy</Text>;
        }

        return record.fullAddress ? (
          <Text>{record.fullAddress}</Text>
        ) : (
          <Text type="secondary">Chưa có địa chỉ</Text>
        );
      },
    },
    {
      title: '% giảm',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      width: 110,
      align: 'center',
      render: (_, record) => {
        if (!record.discountAmount || record.discountAmount <= 0) {
          return <Text type="secondary">0%</Text>;
        }

        return <Tag color="green">{Number(record.discountPercent || 0).toFixed(2)}%</Tag>;
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      search: false,
      width: 150,
      render: (_, record: Order) => (
        <Text strong style={{ color: '#c81d1d' }}>
          {record.totalAmount?.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      width: 170,
      render: (date: any) => (date ? new Date(date).toLocaleString('vi-VN') : 'N/A'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: 'Loại đơn hàng',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 120,
      render: (_, record) => getOrderTypeTag(record.orderType),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      align: 'center',
      fixed: 'right',
      width: 180,
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

        record.status === 'PENDING' && (
          <Popconfirm
            key="confirm"
            title="Xác nhận đơn hàng này?"
            description="Trạng thái sẽ chuyển sang Đã xác nhận để kho xử lý."
            onConfirm={() => handleUpdateStatus(record.id, 'CONFIRMED')}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title="Xác nhận đơn hàng">
              <Button type="primary" icon={<CheckCircleOutlined />} shape="circle" size="large" />
            </Tooltip>
          </Popconfirm>
        ),

        record.status === 'CONFIRMED' && (
          <Popconfirm
            key="ship"
            title="Xác nhận giao hàng?"
            description="Trạng thái sẽ chuyển sang Đang giao hàng và trừ tồn kho."
            onConfirm={() => handleUpdateStatus(record.id, 'SHIPPING')}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title="Giao hàng">
              <Button type="default" icon={<CarOutlined />} shape="circle" size="large" />
            </Tooltip>
          </Popconfirm>
        ),

        record.status === 'SHIPPING' && (
          <Popconfirm
            key="complete"
            title="Hoàn thành đơn hàng?"
            onConfirm={() => handleUpdateStatus(record.id, 'COMPLETED')}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Tooltip title="Hoàn thành">
              <Button
                icon={<CheckCircleOutlined />}
                shape="circle"
                size="large"
                style={{ color: 'green', borderColor: 'green' }}
              />
            </Tooltip>
          </Popconfirm>
        ),
      ],
    },
  ];

  const renderOrderTable = (orders: Order[]) => {
    if (!orders.length) {
      return <Empty description="Không có hóa đơn phù hợp" style={{ padding: '24px 0' }} />;
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
      key: 'PENDING',
      label: `Chờ xác nhận (${baseFilteredOrders.filter((o) => o.status === 'PENDING').length})`,
      children: renderOrderTable(baseFilteredOrders.filter((o) => o.status === 'PENDING')),
    },
    {
      key: 'CONFIRMED',
      label: `Đã xác nhận (${baseFilteredOrders.filter((o) => o.status === 'CONFIRMED').length})`,
      children: renderOrderTable(baseFilteredOrders.filter((o) => o.status === 'CONFIRMED')),
    },
    {
      key: 'SHIPPING',
      label: `Đang giao (${baseFilteredOrders.filter((o) => o.status === 'SHIPPING').length})`,
      children: renderOrderTable(baseFilteredOrders.filter((o) => o.status === 'SHIPPING')),
    },
    {
      key: 'COMPLETED',
      label: `Hoàn thành (${baseFilteredOrders.filter((o) => o.status === 'COMPLETED').length})`,
      children: renderOrderTable(baseFilteredOrders.filter((o) => o.status === 'COMPLETED')),
    },
    {
      key: 'CANCELLED',
      label: `Đã hủy (${baseFilteredOrders.filter((o) => o.status === 'CANCELLED').length})`,
      children: renderOrderTable(baseFilteredOrders.filter((o) => o.status === 'CANCELLED')),
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 14,
        border: '1px solid #e5e7eb',
        boxShadow: '0 6px 16px rgb(0 0 0 / 8%)',
        margin: '16px',
      }}
      bodyStyle={{ padding: 24 }}
      bordered={false}
      title={
        <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
          Quản lý Đơn hàng / Hóa đơn
        </Title>
      }
    >
      <Spin spinning={loading}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
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
                style={{ width: '100%' }}
                options={[
                  { label: 'Tại quầy', value: 'POS' },
                  { label: 'Online', value: 'ONLINE' },
                ]}
              />
            </Col>

            <Col xs={24} md={7}>
              <RangePicker
                value={dateRange}
                onChange={(values) =>
                  setDateRange(values as [Dayjs | null, Dayjs | null] | null)
                }
                style={{ width: '100%' }}
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