import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Input,
  Select,
  Tooltip,
  notification,
  ConfigProvider,
  Row,
  Col,
  Card,
} from 'antd';
import {
  EyeOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { orderService } from '@/services/order.service';
import { printInvoice } from './InvoicePrint';
import OrderDetailModal from './OrderDetailModal';

const { Title, Text } = Typography;

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: 'blue' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'cyan' },
  SHIPPING: { label: 'Đang giao hàng', color: 'orange' },
  COMPLETED: { label: 'Đã hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'default' },
};

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao hàng' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const OrderManagementPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const request = keyword
      ? orderService.searchOrders(keyword, statusFilter || undefined, page, pageSize)
      : orderService.getOrders(page, pageSize, statusFilter || undefined);

    request
      .then((res) => {
        setOrders(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      })
      .catch((err) => {
        console.error('Failed to fetch orders:', err);
        notification.error({ message: 'Lỗi', description: 'Không thể tải danh sách đơn hàng' });
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, statusFilter, keyword]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetail = (record: any) => {
    setSelectedOrderId(record.id);
    setDetailModalOpen(true);
  };

  const handlePrint = (record: any) => {
    orderService
      .getOrderDetail(record.id)
      .then((res) => printInvoice(res.data))
      .catch(() => notification.error({ message: 'Lỗi', description: 'Không thể tải dữ liệu hoá đơn' }));
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    orderService
      .updateOrderStatus(orderId, newStatus)
      .then(() => {
        notification.success({ message: 'Thành công', description: 'Cập nhật trạng thái thành công' });
        fetchOrders();
      })
      .catch(() => notification.error({ message: 'Lỗi', description: 'Cập nhật trạng thái thất bại' }));
  };

  const formatPrice = (price: number) => (price || 0).toLocaleString('vi-VN') + ' ₫';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 55,
      align: 'center' as const,
      render: (_: any, _r: any, index: number) => page * pageSize + index + 1,
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (text: string) => <Text strong copyable>{text}</Text>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 160,
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.customerName || '—'}</Text>
          {record.customerPhone && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{record.customerPhone}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'SL',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 55,
      align: 'center' as const,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right' as const,
      render: (price: number) => (
        <Text strong style={{ color: '#0052D9' }}>{formatPrice(price)}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string, record: any) => {
        const info = statusMap[status] || { label: status, color: 'default' };
        return (
          <Select
            value={status}
            size="small"
            style={{ width: 145 }}
            onChange={(val) => handleStatusChange(record.id, val)}
            options={[
              { value: 'PENDING', label: <Tag color="blue">Chờ thanh toán</Tag> },
              { value: 'CONFIRMED', label: <Tag color="cyan">Đã xác nhận</Tag> },
              { value: 'SHIPPING', label: <Tag color="orange">Đang giao hàng</Tag> },
              { value: 'COMPLETED', label: <Tag color="green">Đã hoàn thành</Tag> },
              { value: 'CANCELLED', label: <Tag color="default">Đã hủy</Tag> },
            ]}
          >
            <Tag color={info.color}>{info.label}</Tag>
          </Select>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 155,
      render: (date: string) => <Text type="secondary">{formatDate(date)}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="In hoá đơn">
            <Button
              icon={<PrinterOutlined />}
              shape="circle"
              type="primary"
              ghost
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: '#0052D9' },
        components: {
          Table: { headerBg: '#F0F8FF', rowHoverBg: '#E6F0FF' },
        },
      }}
    >
      <div style={{ padding: '0' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>Quản lý hoá đơn</Title>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
              Làm mới
            </Button>
          </Col>
        </Row>

        <Card
          bordered={false}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col flex="auto">
              <Input
                placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
                prefix={<SearchOutlined />}
                allowClear
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0);
                }}
                style={{ width: '100%' }}
              />
            </Col>
            <Col>
              <Select
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(0);
                }}
                options={statusOptions}
                style={{ width: 200 }}
              />
            </Col>
          </Row>
        </Card>

        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page + 1,
              pageSize,
              total: totalElements,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
              onChange: (p, ps) => {
                setPage(p - 1);
                setPageSize(ps);
              },
            }}
          />
        </Card>

        <OrderDetailModal
          open={detailModalOpen}
          orderId={selectedOrderId}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedOrderId(null);
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default OrderManagementPage;
