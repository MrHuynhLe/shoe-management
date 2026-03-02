import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Spin,
  notification,
  Empty,
} from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  TagOutlined,
} from '@ant-design/icons';
import type { TableRowSelection } from 'antd/es/table/interface';
import { orderService } from '@/services/order.service';

const { Title, Text } = Typography;
const { confirm } = Modal;

const IMAGE_BASE_URL = 'http://localhost:8080/api';

const CUSTOMER_ID = 1; // TODO: get from auth context

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: 'blue' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'cyan' },
  SHIPPING: { label: 'Đang giao hàng', color: 'cyan' },
  COMPLETED: { label: 'Đã hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'grey' },
};

const getStatusTag = (status: string) => {
  const info = statusMap[status] || { label: status, color: 'default' };
  return <Tag color={info.color}>{info.label}</Tag>;
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    orderService
      .getMyOrders(CUSTOMER_ID, 0, 50)
      .then((res) => {
        setOrders(res.data.content || []);
      })
      .catch((err) => {
        console.error('Failed to fetch orders:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenPaymentModal = (order: any) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const showCancelConfirm = (orderId: number, orderCode: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      icon: <ExclamationCircleOutlined />,
      content: `Đơn hàng: ${orderCode}`,
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Không',
      onOk() {
        orderService
          .updateOrderStatus(orderId, 'CANCELLED')
          .then(() => {
            notification.success({ message: 'Thành công', description: 'Đã hủy đơn hàng' });
            fetchOrders();
          })
          .catch(() => {
            notification.error({ message: 'Lỗi', description: 'Không thể hủy đơn hàng' });
          });
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
      disabled: record.status !== 'PENDING',
    }),
  };

  const formatPrice = (price: number) => (price || 0).toLocaleString('vi-VN') + ' ₫';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (total: number) => (
        <Text strong style={{ color: '#0052D9' }}>{formatPrice(total)}</Text>
      ),
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      render: (discount: number, record: any) => {
        if (!discount || discount === 0) return <Text type="secondary">—</Text>;
        return (
          <Tooltip title={record.voucherCode ? `Mã: ${record.voucherCode}` : ''}>
            <Text strong style={{ color: '#52c41a' }}>
              <TagOutlined /> -{formatPrice(discount)}
            </Text>
          </Tooltip>
        );
      },
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
          {record.status === 'PENDING' && (
            <Tooltip title="Hủy đơn hàng">
              <Button
                icon={<DeleteOutlined style={{ fontSize: '18px' }} />}
                shape="circle"
                danger
                onClick={() => showCancelConfirm(record.id, record.code)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: any) => {
    const items = record.items || [];
    const hasDiscount = record.discountAmount && record.discountAmount > 0;
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);

    if (items.length === 0) {
      return <Empty description="Không có sản phẩm" />;
    }
    return (
      <div style={{ padding: '16px', background: '#fafafa' }}>
        {items.map((item: any, index: number) => (
          <Row key={item.id || index} align="middle" style={{ marginBottom: index === items.length - 1 ? 0 : 16 }}>
            <Col span={2}>
              <Image
                src={item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${IMAGE_BASE_URL}${item.imageUrl}`) : ''}
                width={50}
                height={50}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk3KBr0QAAAABJRU5ErkJggg=="
                preview={false}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginLeft: 16 }}>
                <Text strong>{item.productName}</Text>
                {item.variantInfo && (
                  <div><Text type="secondary" style={{ fontSize: 12 }}>{item.variantInfo}</Text></div>
                )}
              </div>
            </Col>
            <Col span={4} style={{ textAlign: 'right' }}>
              <Text type="secondary">Số lượng: </Text>
              <Text strong>{item.quantity}</Text>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Text strong style={{ color: '#0052D9' }}>{formatPrice(item.totalPrice)}</Text>
            </Col>
          </Row>
        ))}
        {hasDiscount && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Row justify="end" style={{ marginBottom: 4 }}>
              <Col span={10} style={{ textAlign: 'right' }}>
                <Text type="secondary">Tạm tính:</Text>
                <Text strong style={{ marginLeft: 16 }}>{formatPrice(subtotal)}</Text>
              </Col>
            </Row>
            <Row justify="end" style={{ marginBottom: 4 }}>
              <Col span={10} style={{ textAlign: 'right' }}>
                <Text style={{ color: '#52c41a' }}>
                  <TagOutlined /> Giảm giá{record.voucherCode ? ` (${record.voucherCode})` : ''}:
                </Text>
                <Text strong style={{ color: '#52c41a', marginLeft: 16 }}>
                  -{formatPrice(record.discountAmount)}
                </Text>
              </Col>
            </Row>
            <Row justify="end">
              <Col span={10} style={{ textAlign: 'right' }}>
                <Text strong>Thanh toán:</Text>
                <Text strong style={{ color: '#0052D9', marginLeft: 16, fontSize: 16 }}>
                  {formatPrice(record.totalAmount)}
                </Text>
              </Col>
            </Row>
          </>
        )}
      </div>
    );
  };

  const selectedOrdersToPay = orders.filter(
    (item) => selectedRowKeys.includes(item.id)
  );
  const totalToPay = selectedOrdersToPay.reduce(
    (acc, item) => acc + (item.totalAmount || 0),
    0
  );

  const qrCodeUrl = useMemo(() => {
    if (!selectedOrder) return '';
    const { code, total } = selectedOrder;
    const addInfo = `Thanh toan don hang ${code}`.replace(/ /g, '%20');
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
        <Spin spinning={loading}>
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
                  locale={{ emptyText: <Empty description="Bạn chưa có đơn hàng nào" /> }}
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
                    {formatPrice(totalToPay)}
                  </Text>
                </Row>
                <Button
                  type="primary"
                  block
                  size="large"
                  style={{ marginTop: '24px' }}
                  disabled={selectedOrdersToPay.length === 0}
                  onClick={() =>
                    handleOpenPaymentModal({
                      code: selectedOrdersToPay.map((o) => o.code).join(', '),
                      total: totalToPay,
                    })
                  }
                >
                  Thanh toán ngay
                </Button>
              </Card>
            </Col>
          </Row>
        </Spin>

        <Modal
          title={`Thanh toán cho đơn hàng #${selectedOrder?.code}`}
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
              preview={false}
            />
            <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
              <p>Ngân hàng: <strong>Vietcombank</strong></p>
              <p>Số tài khoản: <strong>1234567890123</strong></p>
              <p>Chủ tài khoản: <strong>S-SHOP ONLINE</strong></p>
              <p>
                Số tiền:{' '}
                <strong style={{ color: '#0052D9' }}>
                  {selectedOrder?.total?.toLocaleString('vi-VN')} ₫
                </strong>
              </p>
              <p>Nội dung: <strong>Thanh toan don hang {selectedOrder?.code}</strong></p>
            </div>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default MyOrdersPage;
