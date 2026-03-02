import { useState, useEffect } from 'react';
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Typography,
  Spin,
  Button,
  Image,
  Divider,
  Row,
  Col,
  Card,
} from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { orderService } from '@/services/order.service';
import { printInvoice } from './InvoicePrint';

const { Text, Title } = Typography;

const IMAGE_BASE_URL = 'http://localhost:8080/api';

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: 'blue' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'cyan' },
  SHIPPING: { label: 'Đang giao hàng', color: 'orange' },
  COMPLETED: { label: 'Đã hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'default' },
};

interface OrderDetailModalProps {
  open: boolean;
  orderId: number | null;
  onClose: () => void;
}

const OrderDetailModal = ({ open, orderId, onClose }: OrderDetailModalProps) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      setLoading(true);
      orderService
        .getOrderDetail(orderId)
        .then((res) => setOrder(res.data))
        .catch((err) => console.error('Failed to load order:', err))
        .finally(() => setLoading(false));
    }
    if (!open) {
      setOrder(null);
    }
  }, [open, orderId]);

  const handlePrint = () => {
    if (order) {
      printInvoice(order);
    }
  };

  const formatPrice = (price: number) =>
    (price || 0).toLocaleString('vi-VN') + ' ₫';

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

  const status = statusMap[order?.status] || { label: order?.status, color: 'default' };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center' as const,
      render: (_: any, _r: any, index: number) => index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 70,
      render: (url: string) =>
        url ? (
          <Image
            src={url.startsWith('http') ? url : `${IMAGE_BASE_URL}${url}`}
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={false}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              background: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bbb',
              fontSize: 12,
            }}
          >
            N/A
          </div>
        ),
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.productName}</Text>
          {record.variantInfo && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.variantInfo}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      align: 'right' as const,
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 130,
      align: 'right' as const,
      render: (price: number) => (
        <Text strong style={{ color: '#0052D9' }}>
          {formatPrice(price)}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết đơn hàng
          </Title>
          {order && <Tag color={status.color}>{status.label}</Tag>}
        </div>
      }
      open={open}
      onCancel={onClose}
      width={900}
      destroyOnClose
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          disabled={!order}
        >
          In hoá đơn
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        {order && (
          <>
            <Row gutter={24}>
              <Col span={12}>
                <Card size="small" title="Thông tin đơn hàng" bordered={false} style={{ background: '#F0F8FF' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Mã đơn">
                      <Text strong>{order.code}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">{formatDate(order.createdAt)}</Descriptions.Item>
                    <Descriptions.Item label="Thanh toán">{order.paymentMethod || 'COD'}</Descriptions.Item>
                    {order.note && <Descriptions.Item label="Ghi chú">{order.note}</Descriptions.Item>}
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Thông tin khách hàng" bordered={false} style={{ background: '#F0F8FF' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Họ tên">
                      <Text strong>{order.customerName || order.shippingName || '—'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="SĐT">{order.customerPhone || order.shippingPhone || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{order.shippingAddress || order.customerAddress || '—'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <Table
              columns={columns}
              dataSource={order.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              bordered
              summary={() => {
                const discount = order.discountAmount || 0;
                const finalAmount = (order.totalAmount || 0) - discount;
                return (
                  <>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} />
                      <Table.Summary.Cell index={1} align="right">
                        <Text>Tổng cộng:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <Text strong>{formatPrice(order.totalAmount)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    {discount > 0 && (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4} />
                        <Table.Summary.Cell index={1} align="right">
                          <Text>Giảm giá:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="right">
                          <Text type="danger">-{formatPrice(discount)}</Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                    <Table.Summary.Row style={{ background: '#F0F8FF' }}>
                      <Table.Summary.Cell index={0} colSpan={4} />
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ fontSize: 16 }}>Thanh toán:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <Text strong style={{ fontSize: 16, color: '#0052D9' }}>
                          {formatPrice(finalAmount)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                );
              }}
            />
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default OrderDetailModal;
