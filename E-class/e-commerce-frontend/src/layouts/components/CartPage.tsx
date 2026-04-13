import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  InputNumber,
  Space,
  Typography,
  Row,
  Col,
  Card,
  Image,
  Tooltip,
  Divider,
  message, // eslint-disable-next-line prettier/prettier
  Popconfirm,
  Spin, // eslint-disable-next-line prettier/prettier
  Tabs,
} from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { TableRowSelection } from "antd/es/table/interface";
import { cartService } from "@/services/cart.service";
import { useNavigate, useLocation } from "react-router-dom";
import { orderService } from "@/services/order.service";
import MyOrdersPage from "./MyOrdersPage";

const { Title, Text } = Typography;

interface CartItem {
  key: React.Key;
  id: number;
  productId: number;
  image: string;
  name: string;
  size?: string | null;
  color?: string | null;
  variantCode?: string | null;
  price: number;
  quantity: number;
  total: number;
  variantId: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(
    () => new URLSearchParams(location.search).get("tab") || "cart",
    [location.search],
  ); // eslint-disable-line

  const fetchCart = async () => {
    try {
      setLoadingCart(true);

      const response = await cartService.getCart();
      console.log("API CART:", response.data);
      console.log("FIRST CART ITEM:", response.data.items[0]);
      const items = response.data.items.map((item: any) => ({
        key: item.cartItemId,
        id: item.cartItemId,
        productId: item.productId,
        image: item.imageUrl
          ? `http://localhost:8080/api${item.imageUrl}`
          : "https://via.placeholder.com/80",
        name: `${item.productName} - ${item.variantCode}`,
        size: item.size,
        color: item.color,
        price: item.price,
        quantity: item.quantity,
        total: item.subTotal,
        variantId: item.variantId,
      }));

      setCartItems(items);
    } catch (error: any) {
      console.error("Failed to fetch cart:", error);

      if (error.response?.status === 401) {
        message.error("Vui lòng đăng nhập để xem giỏ hàng!");
        navigate("/account");
      } else if (error.response?.status === 403) {
        setCartItems([]);
      } else {
        message.error("Không thể tải giỏ hàng. Vui lòng thử lại!");
      }
    } finally {
      setLoadingCart(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderService.getMyOrders();
      setAllOrders(
        response.data.content.map((order: any) => ({
          ...order,
          orderDate: order.createdAt,
          key: order.id,
        })),
      );
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error("Vui lòng đăng nhập để xem đơn hàng!");
      } else {
        message.error("Không thể tải danh sách đơn hàng.");
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === "cart") {
      fetchCart();
    } else if (
      ["pending", "confirmed", "shipping", "completed", "cancelled"].includes(
        activeTab,
      ) &&
      !ordersFetched
    ) {
      fetchOrders();
      setOrdersFetched(true);
    }
  }, [activeTab]);

  const handleQuantityChange = async (
    cartItemId: number,
    quantity: number | null,
  ) => {
    if (quantity === null || quantity < 1) return;
    try {
      await cartService.updateItemQuantity(cartItemId, quantity);
      message.success("Cập nhật số lượng thành công!");
      fetchCart();
    } catch (error) {
      message.error("Cập nhật số lượng thất bại!");
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await cartService.removeItem(cartItemId);
      message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      fetchCart();
      setSelectedRowKeys(selectedRowKeys.filter((k) => k !== cartItemId));
    } catch (error) {
      message.error("Xóa sản phẩm thất bại!");
    }
  };

  const handleViewDetail = (record: CartItem) => {
    if (!record.productId) {
      message.warning("Sản phẩm này chưa có productId, cần sửa API giỏ hàng.");
      return;
    }

    navigate(`/products/${record.productId}`);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: CartItem) => (
        <Space align="start">
          <Image width={80} src={record.image} preview={false} />
          <Space direction="vertical" size={4}>
            <Text strong>{record.name}</Text>

            <Space size={[8, 4]} wrap>
              {record.size && (
                <Text type="secondary">
                  Size: <Text strong>{record.size}</Text>
                </Text>
              )}

              {record.color && (
                <Text type="secondary">
                  Màu: <Text strong>{record.color}</Text>
                </Text>
              )}
            </Space>

            {record.variantCode && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Mã SP: {record.variantCode}
              </Text>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => price.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: CartItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => {
            console.log("record:", record);
            handleQuantityChange(record.id, value);
          }}
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      render: (total: number) => (
        <Text strong style={{ color: "#c81d1d" }}>
          {total.toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: CartItem) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa sản phẩm?"
            description="Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?"
            onConfirm={() => handleRemoveItem(record.id)}
            okText="Đồng ý"
            cancelText="Không"
          >
            <Tooltip title="Xóa khỏi giỏ">
              <Button icon={<DeleteOutlined />} shape="circle" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const selectedItems = cartItems.filter((item) =>
    selectedRowKeys.includes(item.key),
  );
  const subtotal = selectedItems.reduce((acc, item) => acc + item.total, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn sản phẩm để thanh toán.");
      return;
    }

    navigate("/checkout", { state: { items: selectedItems, subtotal } });
  };

  const handleTabChange = (key: string) => {
    navigate(`/cart?tab=${key}`);
  };

  const filterOrdersByStatus = (status: string) => {
    return allOrders.filter((order) => order.status === status);
  };

  const tabItems = [
    {
      key: "cart",
      label: `Giỏ hàng của bạn (${cartItems.length})`,
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              bordered={false}
              style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            >
              <Spin spinning={loadingCart}>
                <Table
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={cartItems}
                  pagination={false}
                />
              </Spin>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              hoverable
              bordered={false}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                position: "sticky",
                top: 24,
              }}
            >
              <Title level={4}>Tóm tắt đơn hàng</Title>
              <Divider />
              <Row justify="space-between" key="subtotal-row">
                <Text>Tạm tính ({selectedItems.length} sản phẩm)</Text>
                <Text strong>{subtotal.toLocaleString("vi-VN")} ₫</Text>
              </Row>
              <Divider />
              <Row justify="space-between" key="total-row">
                <Text strong>Tổng cộng</Text>
                <Text strong style={{ color: "#c81d1d", fontSize: "1.2rem" }}>
                  {subtotal.toLocaleString("vi-VN")} ₫
                </Text>
              </Row>
              <Button
                type="primary"
                danger
                block
                size="large"
                style={{ marginTop: "24px" }}
                disabled={selectedItems.length === 0}
                onClick={handleCheckout}
              >
                Tiến hành thanh toán
              </Button>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "pending",
      label: `Chờ xác nhận (${filterOrdersByStatus("PENDING").length})`,
      children: (
        <MyOrdersPage
          orders={filterOrdersByStatus("PENDING")}
          loading={loadingOrders}
          onUpdate={fetchOrders}
        />
      ),
    },
    {
      key: "confirmed",
      label: `Đã xác nhận (${filterOrdersByStatus("CONFIRMED").length})`,
      children: (
        <MyOrdersPage
          orders={filterOrdersByStatus("CONFIRMED")}
          loading={loadingOrders}
          onUpdate={fetchOrders}
        />
      ),
    },
    {
      key: "shipping",
      label: `Đang giao (${filterOrdersByStatus("SHIPPING").length})`,
      children: (
        <MyOrdersPage
          orders={filterOrdersByStatus("SHIPPING")}
          loading={loadingOrders}
          onUpdate={fetchOrders}
        />
      ),
    },
    {
      key: "completed",
      label: `Hoàn thành (${filterOrdersByStatus("COMPLETED").length})`,
      children: (
        <MyOrdersPage
          orders={filterOrdersByStatus("COMPLETED")}
          loading={loadingOrders}
          onUpdate={fetchOrders}
        />
      ),
    },
    {
      key: "cancelled",
      label: `Đã hủy (${filterOrdersByStatus("CANCELLED").length})`,
      children: (
        <MyOrdersPage
          orders={filterOrdersByStatus("CANCELLED")}
          loading={loadingOrders}
          onUpdate={fetchOrders}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Quản lý giỏ hàng & Đơn hàng
      </Title>
      <Tabs activeKey={activeTab} items={tabItems} onChange={handleTabChange} />
    </div>
  );
};

export default CartPage;
