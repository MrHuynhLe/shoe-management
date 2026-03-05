import { useState, useEffect } from 'react';
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
  message,
  Spin,
} from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { TableRowSelection } from 'antd/es/table/interface';
import { cartService } from '@/services/cart.service';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface CartItem {
  key: React.Key;
  id: number;
  image: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  variantId: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

const fetchCart = async () => {
  try {
    setLoading(true);

    const response = await cartService.getCart();
  console.log("API CART:", response.data);
  const items = response.data.items.map((item: any) => ({
  key: item.cartItemId,
  id: item.cartItemId,
  image: item.imageUrl
    ? `http://localhost:8080/api${item.imageUrl}`
    : "https://via.placeholder.com/80",
  name: `${item.productName} - ${item.variantCode}`,
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
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (cartItemId: number, quantity: number | null) => {
      console.log("cartItemId:", cartItemId);
  console.log("quantity:", quantity);
    if (quantity === null || quantity < 1) return;
    try {
      await cartService.updateItemQuantity(cartItemId, quantity);
      message.success('Cập nhật số lượng thành công!');
      fetchCart();
    } catch (error) {
      message.error('Cập nhật số lượng thất bại!');
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await cartService.removeItem(cartItemId);
      message.success('Đã xóa sản phẩm khỏi giỏ hàng!');
      fetchCart();
      setSelectedRowKeys(selectedRowKeys.filter(k => k !== cartItemId));
    } catch (error) {
      message.error('Xóa sản phẩm thất bại!');
    }
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
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: CartItem) => (
        <Space>
          <Image width={80} src={record.image} preview={false} />
          <Text strong>{record.name}</Text>
        </Space>
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
      render: (quantity: number, record: CartItem) => (
        <InputNumber
          min={1}
          value={quantity}
          
          onChange={
            (value) => {
              console.log("record:", record);
  console.log("cartItemId:", record.id);
  handleQuantityChange(record.id, value)}}
        />
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <Text strong style={{ color: '#c81d1d' }}>
          {total.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: CartItem) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} shape="circle" />
          </Tooltip>
          <Tooltip title="Xóa khỏi giỏ">
            <Button
              icon={<DeleteOutlined />}
              shape="circle"
              danger
              onClick={() => handleRemoveItem(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const selectedItems = cartItems.filter((item) => selectedRowKeys.includes(item.key));
  const subtotal = selectedItems.reduce((acc, item) => acc + item.total, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn sản phẩm để thanh toán.');
      return;
    }
    // Chuyển hướng đến trang thanh toán với các sản phẩm đã chọn
    navigate('/checkout', { state: { items: selectedItems, subtotal } });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Giỏ hàng của bạn
      </Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <Spin spinning={loading}>
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
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <Title level={4}>Tóm tắt đơn hàng</Title>
            <Divider />
            <Row justify="space-between" key="subtotal-row">
              <Text>Tạm tính ({selectedItems.length} sản phẩm)</Text>
              <Text strong>{subtotal.toLocaleString('vi-VN')} ₫</Text>
            </Row>
            <Divider />
            <Row justify="space-between" key="total-row">
              <Text strong>Tổng cộng</Text>
              <Text strong style={{ color: '#c81d1d', fontSize: '1.2rem' }}>
                {subtotal.toLocaleString('vi-VN')} ₫
              </Text>
            </Row>
            <Button
              type="primary"
              danger
              block
              size="large"
              style={{ marginTop: '24px' }}
              disabled={selectedItems.length === 0}
              onClick={handleCheckout}
            >
              Tiến hành thanh toán
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartPage;