import { useState } from 'react';
import { Table, Typography, Tag, Button, Space, Modal, Image, Divider } from 'antd';

const { Title, Text } = Typography;

const mockOrders = [
  {
    id: 'SSO-8A4B1C',
    date: '2024-02-28',
    status: 'Chờ thanh toán',
    paymentMethod: 'bank',
    total: 4530000,
    items: [
      { name: 'Adidas Ultraboost 22', quantity: 1, price: 4500000 },
    ],
  },
  {
    id: 'SSO-9D7E2F',
    date: '2024-02-27',
    status: 'Đang giao hàng',
    paymentMethod: 'cod',
    total: 3029000,
    items: [
      { name: 'Nike Air Force 1 \'07', quantity: 1, price: 2999000 },
    ],
  },
  {
    id: 'SSO-3G6H5I',
    date: '2024-02-25',
    status: 'Đã hoàn thành',
    paymentMethod: 'vnpay',
    total: 7499000,
    items: [
      { name: 'Nike Air Jordan 1', quantity: 1, price: 7499000 },
    ],
  },
];

const getStatusTag = (status: string) => {
  switch (status) {
    case 'Chờ thanh toán':
      return <Tag color="orange">{status}</Tag>;
    case 'Đang giao hàng':
      return <Tag color="blue">{status}</Tag>;
    case 'Đã hoàn thành':
      return <Tag color="green">{status}</Tag>;
    case 'Đã hủy':
      return <Tag color="red">{status}</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const MyOrdersPage = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleOpenPaymentModal = (order: any) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => <Text strong style={{ color: '#d0021b' }}>{total.toLocaleString('vi-VN')} ₫</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button>Xem chi tiết</Button>
          {record.status === 'Chờ thanh toán' && record.paymentMethod === 'bank' && (
            <Button type="primary" onClick={() => handleOpenPaymentModal(record)}>Thanh toán</Button>
          )}
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: any) => {
    return (
      <div style={{ padding: '8px 16px', background: '#fafafa' }}>
        <Text strong>Các sản phẩm trong đơn:</Text>
        {record.items.map((item: any, index: number) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <Text>{item.name} (x{item.quantity})</Text>
            <Text>{item.price.toLocaleString('vi-VN')} ₫</Text>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Đơn hàng của tôi</Title>
      <Table
        columns={columns}
        dataSource={mockOrders}
        rowKey="id"
        expandable={{ expandedRowRender }}
        bordered
      />

      <Modal
        title={`Thanh toán cho đơn hàng #${selectedOrder?.id}`}
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsPaymentModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Title level={4}>Quét mã QR để thanh toán</Title>
          <Text>Sử dụng ứng dụng ngân hàng của bạn để quét mã và hoàn tất thanh toán.</Text>
          <Image
            width={200}
            src={`https://api.vietqr.io/image/970422-1234567890123-compact.png?accountName=S-SHOP ONLINE&amount=${selectedOrder?.total}&addInfo=Thanh toan don hang ${selectedOrder?.id}`}
            alt="QR Code thanh toán"
            style={{ margin: '24px 0' }}
          />
          <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
            <p>Ngân hàng: <strong>Vietcombank</strong></p>
            <p>Số tài khoản: <strong>1234567890123</strong></p>
            <p>Chủ tài khoản: <strong>S-SHOP ONLINE</strong></p>
            <p>Số tiền: <strong style={{ color: '#d0021b' }}>{selectedOrder?.total.toLocaleString('vi-VN')} ₫</strong></p>
            <p>Nội dung: <strong>Thanh toan don hang {selectedOrder?.id}</strong></p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyOrdersPage;