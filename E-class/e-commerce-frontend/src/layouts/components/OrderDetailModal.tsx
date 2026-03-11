import { useEffect, useState } from 'react';
import { Modal, Spin, message, Typography, Card, Descriptions, Table, Tag, Image } from 'antd';
import { orderService } from '@/services/order.service';
import { AxiosResponse } from 'axios';

const { Title, Text } = Typography;


interface OrderItem {
  productId: number;
  productName: string;
  variantInfo: string;
  imageUrl: string;
  quantity: number;
  price: number;
  subtotal: number;
  key: React.Key;
}

interface OrderDetail {
  id: number;
  code: string;
  createdAt: string; 
  status: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethodName: string; 
  totalAmount: number;
  shippingFee: number;
  voucherCode?: string;
  discountAmount?: number;
  items: OrderItem[];
}

const OrderDetailModal = ({ orderId, visible, onClose }: { orderId: number | null, visible: boolean, onClose: () => void }) => {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const controller = new AbortController();

    if (orderId && visible) {
      setLoading(true);
      orderService.getOrderDetails(orderId, { signal: controller.signal })
        .then((response: AxiosResponse<OrderDetail>) => {
          setOrder(response.data);
        })
        .catch((error: any) => {

          if (error.name !== 'AbortError') {
            message.error('Không thể tải chi tiết đơn hàng.');
            onClose();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
    return () => controller.abort();
  }, [orderId, visible, onClose]);

  const getStatusTag = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      PENDING: { color: 'gold', text: 'Chờ xác nhận' },
      CONFIRMED: { color: 'lime', text: 'Đã xác nhận' },
      SHIPPING: { color: 'blue', text: 'Đang giao' },
      COMPLETED: { color: 'green', text: 'Hoàn thành' },
      CANCELLED: { color: 'red', text: 'Đã hủy' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const itemColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: OrderItem) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            width={60}
            src={record.imageUrl ? `http://localhost:8080/api${record.imageUrl}` : "https://via.placeholder.com/60"}
            preview={false}
            style={{ marginRight: 12 }}
          />
          <div>
            <Text strong>{text}</Text><br />
            <Text type="secondary">{record.variantInfo}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN') + ' ₫',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (total: number) => <Text strong style={{ color: '#c81d1d' }}>{total.toLocaleString('vi-VN')} ₫</Text>,
    },
  ];

  return (
    <Modal
      title={<Title level={4}>Chi tiết đơn hàng #{order?.code}</Title>}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {order && (
          <Card bordered={false}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Ngày đặt">
                {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{getStatusTag(order.status)}</Descriptions.Item>
              <Descriptions.Item label="Người nhận">{order.customerName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{order.phone}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">{order.address}</Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">{order.paymentMethodName}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Danh sách sản phẩm</Title>
            <Table
              columns={itemColumns}
              dataSource={order.items.map((item) => ({ ...item, key: item.productId }))}
              pagination={false}
              bordered
            />

            <Descriptions bordered column={1} size="small" style={{ marginTop: 24 }}>
                {order.discountAmount && order.discountAmount > 0 && (
                    <Descriptions.Item label="Tiền hàng">
                        {(order.totalAmount - order.shippingFee + order.discountAmount).toLocaleString('vi-VN')} ₫
                    </Descriptions.Item>
                )}
                {order.discountAmount && order.discountAmount > 0 && (
                    <Descriptions.Item label={<Text type="success">Giảm giá ({order.voucherCode})</Text>}>
                        <Text strong type="success">-{order.discountAmount.toLocaleString('vi-VN')} ₫</Text>
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Tổng tiền hàng">
                    <Text strong>{order.shippingFee.toLocaleString('vi-VN')} ₫</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng cộng">
                    <Title level={4} style={{ color: '#c81d1d', margin: 0 }}>{order.totalAmount.toLocaleString('vi-VN')} ₫</Title>
                </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Spin>
    </Modal>
  );
};

export default OrderDetailModal;