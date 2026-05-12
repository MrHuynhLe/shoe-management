import { useEffect, useState } from "react";
import {
  Modal,
  Spin,
  message,
  Typography,
  Card,
  Descriptions,
  Table,
  Tag,
  Image,
  Timeline,
  Space,
  Divider,
} from "antd";
import { orderService } from "@/services/order.service";
import { AxiosResponse } from "axios";

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

interface OrderStatusHistory {
  id: number;
  orderId?: number;
  fromStatus?: string | null;
  toStatus: string;
  changedAt: string;
}

interface OrderDetail {
  id: number;
  code: string;
  createdAt: string;
  status: string;
  customerName: string;
  phone: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  fullAddress?: string;
  paymentMethodName: string;
  subtotalAmount: number;
  totalAmount: number;
  shippingFee: number;
  voucherCode?: string;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT"; 
  discountValue?: number; 
  discountAmount?: number;
  discountPercent?: number;
  orderType?: string | null;
  employeeId?: number | null;
  employeeName?: string | null;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

const formatCurrency = (value?: number) =>
  `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const resolveImageUrl = (imageUrl?: string) => {
  if (!imageUrl) {
    return "https://via.placeholder.com/60";
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `http://localhost:8080/api${imageUrl}`;
};

const getStatusMeta = (status: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    DRAFT: { color: "default", text: "Nháp" },
    PENDING: { color: "gold", text: "Chờ xác nhận" },
    CONFIRMED: { color: "lime", text: "Đã xác nhận" },
    SHIPPING: { color: "blue", text: "Đang giao" },
    COMPLETED: { color: "green", text: "Hoàn thành" },
    CANCELLED: { color: "red", text: "Đã hủy" },
  };

  return statusMap[status] || { color: "default", text: status };
};

const getStatusTag = (status: string) => {
  const meta = getStatusMeta(status);
  return <Tag color={meta.color}>{meta.text}</Tag>;
};

const OrderDetailModal = ({
  orderId,
  visible,
  onClose,
}: {
  orderId: number | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    if (orderId && visible) {
      setLoading(true);

      orderService
        .getOrderDetails(orderId, { signal: controller.signal })
        .then((response: AxiosResponse<OrderDetail>) => {
          setOrder(response.data);
        })
        .catch((error: any) => {
          if (error.name !== "AbortError") {
            message.error("Không thể tải chi tiết đơn hàng.");
            onClose();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }

    return () => controller.abort();
  }, [orderId, visible, onClose]);

  const itemColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, record: OrderItem) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            width={60}
            src={resolveImageUrl(record.imageUrl)}
            preview={false}
            style={{ marginRight: 12, borderRadius: 8, objectFit: "cover" }}
          />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary">{record.variantInfo}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => formatCurrency(price),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Thành tiền",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (total: number) => (
        <Text strong style={{ color: "#c81d1d" }}>
          {formatCurrency(total)}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      title={<Title level={4}>Chi tiết đơn hàng #{order?.code}</Title>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={980}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {order && (
          <Card bordered={false}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Ngày đặt">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("vi-VN")
                  : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái hiện tại">
                {getStatusTag(order.status)}
              </Descriptions.Item>

              <Descriptions.Item label="Loại đơn hàng">
                {order.orderType === "POS" ? "Tại quầy" : "Online"}
              </Descriptions.Item>

              <Descriptions.Item label="Người nhận / Khách hàng">
                {order.customerName || "N/A"}
              </Descriptions.Item>

              {order.phone && (
                <Descriptions.Item label="Số điện thoại">
                  {order.phone}
                </Descriptions.Item>
              )}

              {order.fullAddress && (
                <Descriptions.Item label="Địa chỉ nhận hàng">
                  {order.fullAddress}
                </Descriptions.Item>
              )}

              {order.orderType === "POS" && (
                <>
                  <Descriptions.Item label="ID NV tạo">
                    {order.employeeId || ""}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên NV tạo">
                    {order.employeeName || ""}
                  </Descriptions.Item>
                </>
              )}

              <Descriptions.Item label="Phương thức thanh toán">
                {order.paymentMethodName}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
              Danh sách sản phẩm
            </Title>

            <Table
              columns={itemColumns}
              dataSource={order.items.map((item, index) => ({
                ...item,
                key: `${item.productId}-${item.variantInfo}-${index}`,
              }))}
              pagination={false}
              bordered
            />

            <Descriptions
              bordered
              column={1}
              size="small"
              style={{ marginTop: 24 }}
            >
              <Descriptions.Item label="Tạm tính">
                <Text strong>{formatCurrency(order.subtotalAmount)}</Text>
              </Descriptions.Item>

              {order.discountAmount && order.discountAmount > 0 && (
                <>
                  <Descriptions.Item label="Khuyến mãi">
                    {order.voucherCode ? (
                      <Space>
                
                        <Tag color="green">{order.voucherCode}</Tag>

                        <Tag color="processing">
                          {order.discountType === "PERCENTAGE"
                            ? "Giảm %"
                            : "Giảm tiền"}
                        </Tag>

                        {order.discountType === "PERCENTAGE" ? (
                          <Text strong>-{order.discountValue}%</Text>
                        ) : (
                          <Text strong>
                            -{formatCurrency(order.discountValue)}
                          </Text>
                        )}
                      </Space>
                    ) : (
                      <Text type="secondary">Không áp dụng</Text>
                    )}
                  </Descriptions.Item>

                  <Descriptions.Item label="Số tiền được giảm">
                    <Text strong type="success">
                      -{formatCurrency(order.discountAmount)}
                    </Text>
                  </Descriptions.Item>
                </>
              )}

              <Descriptions.Item label="Phí vận chuyển">
                <Text strong>{formatCurrency(order.shippingFee)}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Tổng thanh toán">
                <Title level={4} style={{ color: "#c81d1d", margin: 0 }}>
                  {formatCurrency(order.totalAmount)}
                </Title>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Title level={5} style={{ margin: 0 }}>
                Lịch sử trạng thái
              </Title>

              {order.statusHistory && order.statusHistory.length > 0 ? (
                <Timeline
                  items={order.statusHistory.map((history) => ({
                    color: getStatusMeta(history.toStatus).color,
                    children: (
                      <Space direction="vertical" size={0}>
                        <Text strong>
                          {getStatusMeta(history.toStatus).text}
                        </Text>
                        <Text type="secondary">
                          {history.changedAt
                            ? new Date(history.changedAt).toLocaleString(
                                "vi-VN",
                              )
                            : "N/A"}
                        </Text>
                        {history.fromStatus && (
                          <Text type="secondary">
                            Từ {getStatusMeta(history.fromStatus).text} →{" "}
                            {getStatusMeta(history.toStatus).text}
                          </Text>
                        )}
                      </Space>
                    ),
                  }))}
                />
              ) : (
                <Text type="secondary">Chưa có lịch sử trạng thái.</Text>
              )}
            </Space>
          </Card>
        )}
      </Spin>
    </Modal>
  );
};

export default OrderDetailModal;
