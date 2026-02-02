import { useState } from 'react';
import { Row, Col, Image, Typography, Button, Space, Divider, InputNumber, Checkbox, Card, Empty, notification, Modal, Steps, Form, Input, Radio } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const initialCartItems = [
  {
    id: 1,
    productId: 101,
    name: 'Nike Air Force 1 \'07',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png',
    size: '42',
    color: 'Trắng',
    price: 2999000,
    quantity: 1,
    stock: 10,
  },
  {
    id: 2,
    productId: 102,
    name: 'Adidas Ultraboost 22',
    imageUrl: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c5b321a9596d46449536ae320126f0f7_9366/Giay_Ultraboost_22_DJen_GZ0127_01_standard.jpg',
    size: '41',
    color: 'Đen',
    price: 4500000,
    quantity: 2,
    stock: 5,
  },
];

const mockCurrentUser = {
  isLoggedIn: true,
  name: 'Nguyễn Văn An',
  phone: '0987654321',
  address: '123 Đường ABC, Phường XYZ, Quận 1, TP. HCM'
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({ name: mockCurrentUser.name, phone: mockCurrentUser.phone, address: mockCurrentUser.address });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleQuantityChange = (itemId: number, quantity: number | null) => {
    if (quantity === null) return;
    setCartItems(
      cartItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId: number) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    setSelectedItems(selectedItems.filter(id => id !== itemId));
    notification.success({ message: 'Đã xóa sản phẩm khỏi giỏ hàng.' });
  };

  const handleSelectItem = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  const selectedProducts = cartItems.filter(item => selectedItems.includes(item.id));
  const totalPrice = selectedProducts.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleOpenCheckoutModal = () => {
    if (selectedProducts.length === 0) {
      notification.warning({ message: 'Vui lòng chọn sản phẩm để thanh toán.' });
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmOrder = () => {
    console.log('Creating order with:', {
        shippingInfo,
        paymentMethod,
        items: selectedProducts,
        total: finalPrice,
    });

    setIsCheckoutModalOpen(false);
    setCurrentStep(0);

    notification.success({ message: 'Đặt hàng thành công!', description: 'Đơn hàng của bạn đã được tạo.' });
    navigate('/my-orders');
  };

  const handleNextStep = async () => {
    if (currentStep === 0) { 
      try {
        const values = await form.validateFields();
        setShippingInfo(values); 
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.log('Validation Failed:', error);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description="Giỏ hàng của bạn đang trống">
          <Button type="primary"><Link to="/products">Mua sắm ngay</Link></Button>
        </Empty>
      </div>
    );
  }

  const shippingFee = selectedProducts.length > 0 ? 30000 : 0;
  const finalPrice = totalPrice + shippingFee;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Giỏ hàng</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <Row align="middle" style={{ marginBottom: 16, padding: '0 16px' }}>
              <Col span={12}>
                <Checkbox
                  indeterminate={selectedItems.length > 0 && selectedItems.length < cartItems.length}
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  Chọn tất cả ({cartItems.length} sản phẩm)
                </Checkbox>
              </Col>
              <Col span={4} style={{ textAlign: 'center' }}><Text type="secondary">Đơn giá</Text></Col>
              <Col span={4} style={{ textAlign: 'center' }}><Text type="secondary">Số lượng</Text></Col>
              <Col span={4} style={{ textAlign: 'center' }}><Text type="secondary">Thành tiền</Text></Col>
            </Row>
            <Divider style={{ margin: 0 }} />
            {cartItems.map(item => (
              <div key={item.id}>
                <Row align="middle" style={{ padding: '16px' }}>
                  <Col span={12}>
                    <Space align="start">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      />
                      <Image src={item.imageUrl} width={80} height={80} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ marginLeft: 8 }}>
                        <Link to={`/products/${item.productId}`}>
                          <Text strong style={{ display: 'block' }}>{item.name}</Text>
                        </Link>
                        <Text type="secondary">Phân loại: {item.color}, {item.size}</Text>
                      </div>
                    </Space>
                  </Col>
                  <Col span={4} style={{ textAlign: 'center' }}>
                    <Text strong>{item.price.toLocaleString('vi-VN')} ₫</Text>
                  </Col>
                  <Col span={4} style={{ textAlign: 'center' }}>
                    <InputNumber
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(value) => handleQuantityChange(item.id, value)}
                      style={{ width: 60 }}
                    />
                  </Col>
                  <Col span={3} style={{ textAlign: 'center' }}>
                    <Text strong color="red">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</Text>
                  </Col>
                  <Col span={1} style={{ textAlign: 'right' }}>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(item.id)}
                      danger
                    />
                  </Col>
                </Row>
                <Divider style={{ margin: 0 }} />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Tổng kết">
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Tạm tính</Text>
              <Text strong>{totalPrice.toLocaleString('vi-VN')} ₫</Text>
            </Row>
            <Row justify="space-between">
              <Text>Phí vận chuyển</Text>
              <Text strong>{shippingFee.toLocaleString('vi-VN')} ₫</Text>
            </Row>
            <Divider />
            <Row justify="space-between">
              <Text strong>Tổng cộng</Text>
              <Title level={3} style={{ margin: 0, color: '#d0021b' }}>{finalPrice.toLocaleString('vi-VN')} ₫</Title>
            </Row>
            <Divider />
            <Button
              type="primary"
              size="large"
              block
              onClick={handleOpenCheckoutModal}
              disabled={selectedProducts.length === 0}
            >
              Thanh toán
            </Button>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Quy trình thanh toán"
        open={isCheckoutModalOpen}
        onCancel={() => setIsCheckoutModalOpen(false)}
        width={800}
        footer={
          <Space>
            {currentStep > 0 && <Button onClick={() => setCurrentStep(currentStep - 1)}>Quay lại</Button>}
            {currentStep < 3 && <Button type="primary" onClick={handleNextStep}>Tiếp tục</Button>}
            {currentStep === 3 && <Button type="primary" onClick={handleConfirmOrder}>Xác nhận và Đặt hàng</Button>}
          </Space>
        }
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Steps.Step title="Giao hàng" />
          <Steps.Step title="Mã giảm giá" />
          <Steps.Step title="Thanh toán" />
          <Steps.Step title="Xác nhận" />
        </Steps>

        <div style={{ marginTop: 24, minHeight: 200 }}>
          {currentStep === 0 && (
            <Form form={form} layout="vertical" initialValues={shippingInfo} onValuesChange={(_, values) => setShippingInfo(values)}>
              <Title level={4}>1. Thông tin giao hàng</Title>
              <Form.Item name="name" label="Họ và tên người nhận" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ nhận hàng" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Form>
          )}
          {currentStep === 1 && (
            <div>
              <Title level={4}>2. Mã giảm giá</Title>
              <Space.Compact style={{ width: '100%' }}>
                <Input placeholder="Nhập mã giảm giá của bạn" />
                <Button type="primary">Áp dụng</Button>
              </Space.Compact>
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <Title level={4}>3. Phương thức thanh toán</Title>
              <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                <Space direction="vertical">
                  <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
                  <Radio value="bank">Chuyển khoản ngân hàng</Radio>
                  <Radio value="vnpay">Thanh toán qua VNPAY</Radio>
                </Space>
              </Radio.Group>
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <Title level={4}>4. Xác nhận đơn hàng</Title>
              <Card size="small">
                <p><strong>Người nhận:</strong> {shippingInfo.name}</p>
                <p><strong>Số điện thoại:</strong> {shippingInfo.phone}</p>
                <p><strong>Địa chỉ:</strong> {shippingInfo.address}</p>
                <p><strong>Phương thức thanh toán:</strong> {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : (paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'VNPAY')}</p>                
                <Divider />
                <Title level={5}>Sản phẩm</Title>
                {selectedProducts.map(item => (
                  <Row key={item.id} justify="space-between" style={{ marginBottom: 8 }}>
                    <Col>
                      <Text>{item.name} (x{item.quantity})</Text>
                    </Col>
                    <Col>
                      <Text strong>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</Text>
                    </Col>
                  </Row>
                ))}
                <Divider />
                <Row justify="space-between"><Text>Tổng cộng:</Text> <Title level={4} style={{ margin: 0, color: '#d0021b' }}>{finalPrice.toLocaleString('vi-VN')} ₫</Title></Row>
              </Card>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CartPage;
