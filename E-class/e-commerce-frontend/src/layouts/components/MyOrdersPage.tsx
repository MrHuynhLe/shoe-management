import { useState } from "react";
import {
  Table,
  Tag,
  Typography,
  Card,
  Button,
  Space,
  Spin,
  Popconfirm,
  message,
  Tooltip,
  Modal,
  Input,
} from "antd";
import { useNavigate } from "react-router-dom";
import OrderDetailModal from "./OrderDetailModal";
import { orderService } from "@/services/order.service";
import { DeleteOutlined, CreditCardOutlined } from "@ant-design/icons";
import { useAuth } from "@/services/AuthContext";

const { Title, Text } = Typography;

interface Order {
  id: number;
  key: React.Key;
  code: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  orderType?: string;
  discountAmount?: number;
  voucherCode?: string;
  paymentStatus?: string;
  paymentMethodCode?: string;
  paymentMethodName?: string;
  canRetryVnpay?: boolean;
}

const MyOrdersPage = ({
  orders,
  loading,
  onUpdate,
}: {
  orders: Order[];
  loading: boolean;
  onUpdate: () => void;
}) => {
  const navigate = useNavigate();
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returningOrderId, setReturningOrderId] = useState<number | null>(null);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [retryingOrderId, setRetryingOrderId] = useState<number | null>(null);
  const { fetchOrderCount } = useAuth();

  const handleViewDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await orderService.cancelOrder(orderId);
      message.success("Hủy đơn hàng thành công!");
      onUpdate();
      fetchOrderCount();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Hủy đơn hàng thất bại.");
    }
  };

  const handleRetryVnpay = async (orderId: number) => {
    try {
      setRetryingOrderId(orderId);

      const response = await orderService.createOnlineVnpayPayment(orderId);
      const paymentUrl = response.data.paymentUrl;

      if (!paymentUrl) {
        throw new Error("Không tạo được link thanh toán VNPAY");
      }

      window.location.href = paymentUrl;
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể khởi tạo lại thanh toán VNPAY.",
      );
    } finally {
      setRetryingOrderId(null);
    }
  };

  const openReturnModal = (orderId: number) => {
    setReturningOrderId(orderId);
    setReturnReason("");
    setIsReturnModalOpen(true);
  };

  const handleSubmitReturnRequest = async () => {
    if (!returningOrderId) {
      return;
    }

    if (!returnReason.trim() || returnReason.trim().length < 10) {
      message.warning("Lý do trả hàng phải có ít nhất 10 ký tự.");
      return;
    }

    try {
      setSubmittingReturn(true);
      await orderService.requestReturn(returningOrderId, {
        reason: returnReason.trim(),
      });

      message.success("Gửi yêu cầu trả hàng thành công.");
      setIsReturnModalOpen(false);
      setReturningOrderId(null);
      setReturnReason("");
      onUpdate();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Không thể gửi yêu cầu trả hàng.",
      );
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Tag color="gold">Chờ xác nhận</Tag>;
      case "CONFIRMED":
        return <Tag color="lime">Đã xác nhận</Tag>;
      case "SHIPPING":
        return <Tag color="blue">Đang giao</Tag>;
      case "COMPLETED":
        return <Tag color="green">Hoàn thành</Tag>;
      case "CANCELLED":
        return <Tag color="red">Đã hủy</Tag>;
      case "RETURN_REQUESTED":
        return <Tag color="orange">Chờ duyệt trả hàng</Tag>;
      case "RETURNED":
        return <Tag color="purple">Đã trả hàng</Tag>;
      case "RETURN_REJECTED":
        return <Tag color="volcano">Từ chối trả hàng</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  const getPaymentStatusTag = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case "PAID":
        return <Tag color="green">Đã thanh toán</Tag>;
      case "PENDING":
        return <Tag color="gold">Chưa thanh toán</Tag>;
      case "FAILED":
        return <Tag color="red">Thanh toán thất bại</Tag>;
      case "EXPIRED":
        return <Tag color="orange">Hết hạn thanh toán</Tag>;
      case "REFUND_PENDING":
        return <Tag color="purple">Chờ hoàn tiền</Tag>;
      case "REFUNDED":
        return <Tag color="cyan">Đã hoàn tiền</Tag>;
      default:
        return <Tag>Chưa có thông tin</Tag>;
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <Text strong>#{text}</Text>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d.getTime())
          ? d.toLocaleDateString("vi-VN")
          : "Ngày không hợp lệ";
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <Text strong style={{ color: "#c81d1d" }}>
          {amount.toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discountAmount",
      key: "discountAmount",
      render: (discount: number, record: Order) => {
        if (!discount || discount === 0) {
          return <Text type="secondary">Không có</Text>;
        }
        return (
          <Space direction="vertical" size={0}>
            <Text type="success" strong>
              -{discount.toLocaleString("vi-VN")} ₫
            </Text>
            {record.voucherCode && (
              <Tag color="green">{record.voucherCode}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
    },
    {
      title: "Thanh toán",
      key: "payment",
      render: (_: any, record: Order) => (
        <Space direction="vertical" size={4}>
          {getPaymentStatusTag(record.paymentStatus)}
          {record.paymentMethodName && (
            <Text type="secondary">{record.paymentMethodName}</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Order) => (
        <Space wrap>
          <Button type="primary" onClick={() => handleViewDetails(record.id)}>
            Xem chi tiết
          </Button>

          {record.canRetryVnpay && (
            <Button
              icon={<CreditCardOutlined />}
              loading={retryingOrderId === record.id}
              onClick={() => handleRetryVnpay(record.id)}
            >
              Thanh toán lại
            </Button>
          )}
          {record.status === "COMPLETED" && record.orderType === "ONLINE" && (
            <Button onClick={() => openReturnModal(record.id)}>
              Yêu cầu trả hàng
            </Button>
          )}

          {record.status === "PENDING" && (
            <Popconfirm
              title="Bạn chắc chắn muốn hủy đơn hàng này?"
              description="Hành động này không thể hoàn tác."
              onConfirm={() => handleCancelOrder(record.id)}
              okText="Đồng ý"
              cancelText="Không"
            >
              <Tooltip title="Hủy đơn hàng">
                <Button icon={<DeleteOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        bordered={false}
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
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
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <Title level={4}>Không có đơn hàng nào trong mục này</Title>
                <Text type="secondary">
                  Hãy kiểm tra các mục khác hoặc tiếp tục mua sắm nhé!
                </Text>
                <br />
                <Button
                  type="primary"
                  style={{ marginTop: 16 }}
                  onClick={() => navigate("/products")}
                >
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
      <Modal
        title="Yêu cầu trả hàng"
        open={isReturnModalOpen}
        onCancel={() => {
          setIsReturnModalOpen(false);
          setReturningOrderId(null);
          setReturnReason("");
        }}
        onOk={handleSubmitReturnRequest}
        okText="Gửi yêu cầu"
        cancelText="Đóng"
        confirmLoading={submittingReturn}
      >
        <Input.TextArea
          rows={4}
          value={returnReason}
          onChange={(e) => setReturnReason(e.target.value)}
          placeholder="Nhập lý do trả hàng, ví dụ: sản phẩm lỗi, sai size, sai màu..."
        />
      </Modal>
    </>
  );
};

export default MyOrdersPage;
