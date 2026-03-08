import { useState } from 'react';
import { Table, Tag, Typography, Card, Button, Space, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import OrderDetailModal from './OrderDetailModal';

const { Title, Text } = Typography;

interface Order {
  id: number;
  key: React.Key;
  code: string;
  orderDate: string;
  totalAmount: number;
  status: string;
}

const MyOrdersPage = ({ orders, loading }: { orders: Order[], loading: boolean }) => {
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleViewDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };
  
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Tag color="gold">Chờ xác nhận</Tag>;
      case 'CONFIRMED':
        return <Tag color="lime">Đã xác nhận</Tag>;
      case 'SHIPPING':
        return <Tag color="blue">Đang giao</Tag>;
      case 'COMPLETED':
        return <Tag color="green">Hoàn thành</Tag>;
      case 'CANCELLED':
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <Text strong>#{text}</Text>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d.getTime()) ? d.toLocaleDateString('vi-VN') : 'Ngày không hợp lệ';
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => <Text strong style={{ color: '#c81d1d' }}>{amount.toLocaleString('vi-VN')} ₫</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="primary" onClick={() => handleViewDetails(record.id)}>
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        bordered={false}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      >
        <Spin spinning={loading}>
          {orders.length > 0 ? (
            <Table
              columns={columns}
              dataSource={orders}
              pagination={{ pageSize: 10 }}
              rowKey="key"
            />
          ) : (
            !loading && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Title level={4}>Không có đơn hàng nào trong mục này</Title>
                <Text type="secondary">Hãy kiểm tra các mục khác hoặc tiếp tục mua sắm nhé!</Text>
                <br />
                <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/products')}>
                  Đến trang sản phẩm
                </Button>
              </div>
            )
          )}
        </Spin>
      </Card>
      <OrderDetailModal
        orderId={selectedOrderId}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
};

export default MyOrdersPage;