import { useState, useRef, useEffect, useMemo } from 'react';
import { Tag, Space, Button, message, Tooltip, Popconfirm, Tabs, Table, Spin, Typography, Card } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CarOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import { adminOrderService } from '@/services/admin.order.service';
import { useLocation, useNavigate } from 'react-router-dom';
import OrderDetailModal from '@/layouts/components/OrderDetailModal';

const { Title, Text } = Typography;

interface Order {
  id: number;
  code: string;
  customer?: {
    userProfile?: {
      fullName?: string;
    }
  };
  customerName?: string;
  phone?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderType?: string | null; 
}

const OrderManagementPage = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => new URLSearchParams(location.search).get('tab') || 'PENDING', [location.search]);

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
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
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

  const columns: ProColumns<Order>[] = [
    { title: 'ID', dataIndex: 'id', width: 48, search: false },
    { title: 'Mã đơn hàng', dataIndex: 'code', render: (text) => <Text strong>#{text}</Text> },
    { title: 'Tên khách hàng', dataIndex: ['customer', 'userProfile', 'fullName'], key: 'customerName' },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      render: (value) => value || 'N/A'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      search: false,
      render: (_, record: Order) => <Text strong style={{ color: '#c81d1d' }}>{record.totalAmount?.toLocaleString('vi-VN')} ₫</Text>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      render: (date: any) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueEnum: {
        PENDING: { text: 'Chờ xử lý', status: 'Warning' },
        SHIPPING: { text: 'Đang giao hàng', status: 'Processing' },
        COMPLETED: { text: 'Hoàn thành', status: 'Success' },
        CANCELLED: { text: 'Đã hủy', status: 'Error' },
      },
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: 'Loại đơn hàng',
      dataIndex: 'orderType',
      key: 'orderType',
      render: (_, record) => record.orderType === 'POS' ? <Tag color="blue">Tại quầy</Tag> : <Tag color="geekblue">Online</Tag>,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      align: 'center',
      render: (_, record) => [
        <Tooltip title="Xem chi tiết" key="view">
          <Button icon={<EyeOutlined />} shape="circle" type="text" size="large" onClick={() => { setSelectedOrderId(record.id); setIsModalVisible(true); }} />
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
              <Button icon={<CheckCircleOutlined />} shape="circle" size="large" style={{ color: 'green', borderColor: 'green' }} />
            </Tooltip>
          </Popconfirm>
        ),
      ],
    },
  ];

  const renderOrderTable = (status: string) => {
    const filteredOrders = allOrders.filter(order => order.status === status);
    return (
      <Table
        columns={columns as any}
        dataSource={filteredOrders}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    );
  };

  const tabItems = [
    { key: 'PENDING', label: `Chờ xác nhận (${allOrders.filter(o => o.status === 'PENDING').length})`, children: renderOrderTable('PENDING') },
    { key: 'CONFIRMED', label: `Đã xác nhận (${allOrders.filter(o => o.status === 'CONFIRMED').length})`, children: renderOrderTable('CONFIRMED') },
    { key: 'SHIPPING', label: `Đang giao (${allOrders.filter(o => o.status === 'SHIPPING').length})`, children: renderOrderTable('SHIPPING') },
    { key: 'COMPLETED', label: `Hoàn thành (${allOrders.filter(o => o.status === 'COMPLETED').length})`, children: renderOrderTable('COMPLETED') },
    { key: 'CANCELLED', label: `Đã hủy (${allOrders.filter(o => o.status === 'CANCELLED').length})`, children: renderOrderTable('CANCELLED') },
  ];

  return (
    <Card
      style={{ borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 6px 16px rgb(0 0 0 / 8%)', margin: '16px' }}
      bodyStyle={{ padding: 24 }}
      bordered={false}
      title={<Title level={3} style={{ margin: 0, color: '#0f172a' }}>Quản lý Đơn hàng</Title>}
    >
      <Spin spinning={loading}>
        <Tabs defaultActiveKey="PENDING" activeKey={activeTab} items={tabItems} onChange={(key) => navigate(`/admin/orders?tab=${key}`)} />
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