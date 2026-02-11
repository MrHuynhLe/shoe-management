import { useState, useMemo } from 'react';
import {
  Table,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Image,
  Row,
  Col,
  Card,
  Tooltip,
  Divider,
  ConfigProvider,
} from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { TableRowSelection } from 'antd/es/table/interface';

const { Title, Text } = Typography;
const { confirm } = Modal;

const mockOrders = [
  {
    id: 'SSO-8A4B1C',
    date: '2024-02-28',
    status: 'Chờ thanh toán',
    total: 4530000,
    items: [
      { name: 'Adidas Ultraboost 22', quantity: 1, price: 4500000, imageUrl: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c5b321a9596d46449536ae320126f0f7_9366/Giay_Ultraboost_22_DJen_GZ0127_01_standard.jpg' },
    ],
  },
  {
    id: 'SSO-9D7E2F',
    date: '2024-02-27',
    status: 'Đang giao hàng',
    total: 3029000,
    items: [
      { name: 'Nike Air Force 1 \'07', quantity: 1, price: 2999000, imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png' },
    ],
  },
  {
    id: 'SSO-3G6H5I',
    date: '2024-02-25',
    status: 'Đã hoàn thành',
    total: 7499000,
    items: [
      { name: 'Nike Air Jordan 1', quantity: 1, price: 7499000, imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/e125b578-4173-401a-ab13-f066de77d325/air-jordan-1-mid-shoes-86f1ZW.png' },
    ],
  },
  {
    id: 'SSO-4J8K9L',
    date: '2024-02-29',
    status: 'Chờ thanh toán',
    total: 1800000,
    items: [{ name: 'Puma Suede Classic', quantity: 1, price: 1800000, imageUrl: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Men\'s-Sneakers' }],
  },
];

const getStatusTag = (status: string) => {
  switch (status) {
    case 'Chờ thanh toán':
      return <Tag color="blue">{status}</Tag>;
    case 'Đang giao hàng':
      return <Tag color="cyan">{status}</Tag>;
    case 'Đã hoàn thành':
      return <Tag color="green">{status}</Tag>;
    case 'Đã hủy':
      return <Tag color="grey">{status}</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleOpenPaymentModal = (order: any) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const showCancelConfirm = (orderId: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      icon: <ExclamationCircleOutlined />,
      content: `Đơn hàng: ${orderId}`,
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Không',
      onOk() {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: 'Đã hủy' } : o))
        );
      },
    });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: any) => ({
      disabled: record.status !== 'Chờ thanh toán',
    }),
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
      render: (total: number) => <Text strong style={{ color: '#0052D9' }}>{total.toLocaleString('vi-VN')} ₫</Text>,
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
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined style={{ fontSize: '18px' }} />} shape="circle" />
          </Tooltip>
          {record.status === 'Chờ thanh toán' && (
            <Tooltip title="Hủy đơn hàng">
              <Button
                icon={<DeleteOutlined style={{ fontSize: '18px' }} />}
                shape="circle"
                danger
                onClick={() => showCancelConfirm(record.id)}
              />
            </Tooltip>
          )}
      
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: any) => {
    return (
      <div style={{ padding: '16px', background: '#fafafa' }}>
        {record.items.map((item: any, index: number) => (
          <Row key={index} align="middle" style={{ marginBottom: index === record.items.length - 1 ? 0 : 16 }}>
            <Col span={2}><Image src={item.imageUrl} width={50} height={50} style={{ objectFit: 'cover', borderRadius: '4px' }} /></Col>
            <Col span={16}><Text style={{ marginLeft: 16 }}>{item.name}</Text></Col>
            <Col span={6} style={{ textAlign: 'right' }}><Text type="secondary">Số lượng: </Text><Text strong>{item.quantity}</Text></Col>
          </Row>
        ))}
      </div>
    );
  };

  const selectedOrdersToPay = orders.filter(
    (item) => selectedRowKeys.includes(item.id)
  );
  const totalToPay = selectedOrdersToPay.reduce(
    (acc, item) => acc + item.total,
    0
  );

  const qrCodeUrl = useMemo(() => {
    if (!selectedOrder) return '';
    const { id, total } = selectedOrder;
    const addInfo = `Thanh toan don hang ${id}`.replace(/ /g, '%20');
    return `https://api.vietqr.io/image/970422-1234567890123-compact.png?accountName=S-SHOP%20ONLINE&amount=${total}&addInfo=${addInfo}`;
  }, [selectedOrder]);

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: '#0052D9' },
        components: {
          Table: {
            headerBg: '#F0F8FF',
            rowHoverBg: '#E6F0FF',
          },
        },
      }}
    >
      <div style={{ padding: '24px' }}> 
        <Title level={2}>Đơn hàng của tôi</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={17}>
            <Card
              bordered={false}
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s' }}
            >
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={orders}
                rowKey="id"
                expandable={{ expandedRowRender }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={7}>
            <Card
              hoverable
              bordered={false}
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s' }}
            >
              <Title level={4}>Thanh toán đơn hàng</Title>
              <Divider />
              <Row justify="space-between">
                <Text>Số đơn hàng đã chọn</Text>
                <Text strong>{selectedOrdersToPay.length}</Text>
              </Row>
              <Divider />
              <Row justify="space-between">
                <Text strong>Tổng tiền cần thanh toán</Text>
                <Text strong style={{ color: '#0052D9', fontSize: '1.2rem' }}>
                  {totalToPay.toLocaleString('vi-VN')} ₫
                </Text>
              </Row>
              <Button
                type="primary"
                block
                size="large"
                style={{ marginTop: '24px' }}
                disabled={selectedOrdersToPay.length === 0}
                onClick={() => handleOpenPaymentModal({ id: selectedOrdersToPay.map(o => o.id).join(', '), total: totalToPay })}
              >
                Thanh toán ngay</Button>
            </Card>
          </Col>
        </Row>

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
              src={qrCodeUrl}
              alt="QR Code thanh toán"
              style={{ margin: '24px 0' }}
            />
            <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
              <p>Ngân hàng: <strong>Vietcombank</strong></p>
              <p>Số tài khoản: <strong>1234567890123</strong></p>
              <p>Chủ tài khoản: <strong>S-SHOP ONLINE</strong></p>
            <p>Số tiền: <strong style={{ color: '#0052D9' }}>{selectedOrder?.total.toLocaleString('vi-VN')} ₫</strong></p>
              <p>Nội dung: <strong>Thanh toan don hang {selectedOrder?.id}</strong></p>
            </div>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};
export default MyOrdersPage;