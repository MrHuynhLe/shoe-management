import { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Image,
  Typography,
  Button,
  Space,
  Divider,
  InputNumber,
  Checkbox,
  Card,
  Empty,
  notification,
  Modal,
  Steps,
  Form,
  Input,
  Radio,
  Spin,
  Alert,
} from 'antd';
import { DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, TagOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { orderService } from '@/services/order.service';
import { voucherService } from '@/services/voucher.service';

const { Title, Text } = Typography;
interface CartItem {
  id: number;
  productId: number;
  productVariantId: number;
  name: string;
  imageUrl: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  stock: number;
}

interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
}

interface VoucherApplied {
  code: string;
  name: string;
  discountType: string;
  discountAmount: number;
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    productId: 101,
    productVariantId: 1,
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
    productVariantId: 2,
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
  customerId: 1,
  name: 'Nguyễn Văn An',
  phone: '0987654321',
  address: '123 Đường ABC, Phường XYZ, Quận 1, TP. HCM'
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: mockCurrentUser.name,
    phone: mockCurrentUser.phone,
    address: mockCurrentUser.address,
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState<VoucherApplied | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const handleQuantityChange = (itemId: number, quantity: number | null) => {
    if (quantity === null) return;
    setCartItems(
      cartItems.map(item => (item.id === itemId ? { ...item, quantity } : item))
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

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const selectedProducts = useMemo(() =>
    cartItems.filter(item => selectedItems.includes(item.id)), [cartItems, selectedItems]);

  const totalPrice = useMemo(() =>
    selectedProducts.reduce((total, item) => total + item.price * item.quantity, 0), [selectedProducts]);

  const discountAmount = voucherApplied?.discountAmount || 0;
  const shippingFee = selectedProducts.length > 0 ? 30000 : 0;
  const finalPrice = totalPrice - discountAmount + shippingFee;

  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;
  const isIndeterminate = selectedItems.length > 0 && !isAllSelected;

  const handleOpenCheckoutModal = () => {
    if (selectedProducts.length === 0) {
      notification.warning({ message: 'Vui lòng chọn sản phẩm để thanh toán.' });
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return;
    }
    setVoucherLoading(true);
    setVoucherError('');
    try {
      const res = await voucherService.apply(voucherCode.trim(), totalPrice);
      const data = res.data;
      if (data.valid) {
        setVoucherApplied({
          code: data.voucherCode,
          name: data.voucherName,
          discountType: data.discountType,
          discountAmount: data.discountAmount,
        });
        setVoucherError('');
      } else {
        setVoucherError(data.message || 'Mã giảm giá không hợp lệ');
        setVoucherApplied(null);
      }
    } catch {
      setVoucherError('Không thể áp dụng mã giảm giá. Vui lòng thử lại.');
      setVoucherApplied(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherApplied(null);
    setVoucherCode('');
    setVoucherError('');
  };

  const handleConfirmOrder = async () => {
    setOrderLoading(true);
    try {
      const payload = {
        customerId: mockCurrentUser.customerId,
        shippingName: shippingInfo.name,
        shippingPhone: shippingInfo.phone,
        shippingAddress: shippingInfo.address,
        paymentMethod,
        note: '',
        voucherCode: voucherApplied?.code || undefined,
        items: selectedProducts.map(item => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
      };
      await orderService.createOrder(payload);

      setIsCheckoutModalOpen(false);
      setCurrentStep(0);
      setVoucherApplied(null);
      setVoucherCode('');

      // Remove ordered items from cart
      const orderedIds = selectedProducts.map(item => item.id);
      setCartItems(prev => prev.filter(item => !orderedIds.includes(item.id)));
      setSelectedItems([]);

      notification.success({ message: 'Đặt hàng thành công!', description: 'Đơn hàng của bạn đã được tạo.' });
      navigate('/my-orders');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      notification.error({ message: 'Đặt hàng thất bại', description: msg });
    } finally {
      setOrderLoading(false);
    }
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

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Giỏ hàng</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s' }}
          >
            <Row
              align="middle"
              style={{
                padding: '12px 16px',
                background: '#F0F8FF',
              }}
            >
              <Col span={12}>
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
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
                <Row
                  align="middle"
                  style={{
                    padding: '16px',
                    transition: 'all 0.3s',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E6F0FF';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Col span={12}>
                    <Space align="start">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={e => handleSelectItem(item.id, e.target.checked)}
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
                      onChange={value => handleQuantityChange(item.id, value)}
                      style={{ width: 60 }}
                    />
                  </Col>
                  <Col span={3} style={{ textAlign: 'center' }}>
                    <Text strong style={{ color: '#d32f2f' }}>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</Text>
                  </Col>
                  <Col span={1} style={{ textAlign: 'right' }}>
                    <Button
                      type="text"
                      icon={<DeleteOutlined style={{ fontSize: '18px' }} />}
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
          <Card
            title="Tổng kết"
            headStyle={{ background: '#F0F8FF', fontWeight: 600 }}
            hoverable
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s' }}
          >
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Tạm tính</Text>
              <Text strong>{totalPrice.toLocaleString('vi-VN')} ₫</Text>
            </Row>
            {discountAmount > 0 && (
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Text style={{ color: '#52c41a' }}>
                  <TagOutlined /> Giảm giá ({voucherApplied?.code})
                </Text>
                <Text strong style={{ color: '#52c41a' }}>-{discountAmount.toLocaleString('vi-VN')} ₫</Text>
              </Row>
            )}
            <Row justify="space-between">
              <Text>Phí vận chuyển</Text>
              <Text strong>{shippingFee.toLocaleString('vi-VN')} ₫</Text>
            </Row>
            <Divider />
            <Row justify="space-between">
              <Text strong>Tổng cộng</Text>
              <Title level={3} style={{ margin: 0, color: '#0052D9' }}>{finalPrice.toLocaleString('vi-VN')} ₫</Title>
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
        onCancel={() => { setIsCheckoutModalOpen(false); setCurrentStep(0); }}
        width={800}
        footer={
          <Space>
            {currentStep > 0 && <Button onClick={() => setCurrentStep(currentStep - 1)}>Quay lại</Button>}
            {currentStep < 2 && <Button type="primary" onClick={handleNextStep}>Tiếp tục</Button>}
            {currentStep === 2 && (
              <Button type="primary" onClick={handleConfirmOrder} loading={orderLoading}>
                Xác nhận và Đặt hàng
              </Button>
            )}
          </Space>
        }
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Steps.Step title="Giao hàng" />
          <Steps.Step title="Mã giảm giá" />
          <Steps.Step title="Xác nhận" />
        </Steps>

        <div style={{ marginTop: 24, minHeight: 200 }}>
          {currentStep === 0 && (
            <Form form={form} layout="vertical" initialValues={shippingInfo}>
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
              <Divider />
              <Title level={5}>Phương thức thanh toán</Title>
              <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <Space direction="vertical">
                  <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
                  <Radio value="bank_transfer">Chuyển khoản ngân hàng</Radio>
                </Space>
              </Radio.Group>
            </Form>
          )}
          {currentStep === 1 && (
            <div>
              <Title level={4}>2. Mã giảm giá</Title>
              {!voucherApplied ? (
                <>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      placeholder="Nhập mã giảm giá của bạn"
                      value={voucherCode}
                      onChange={e => { setVoucherCode(e.target.value); setVoucherError(''); }}
                      onPressEnter={handleApplyVoucher}
                      disabled={voucherLoading}
                    />
                    <Button type="primary" onClick={handleApplyVoucher} loading={voucherLoading}>
                      Áp dụng
                    </Button>
                  </Space.Compact>
                  {voucherError && (
                    <Alert
                      type="error"
                      message={voucherError}
                      showIcon
                      icon={<CloseCircleOutlined />}
                      style={{ marginTop: 12 }}
                    />
                  )}
                </>
              ) : (
                <Card
                  size="small"
                  style={{
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 8,
                  }}
                >
                  <Row align="middle" justify="space-between">
                    <Col>
                      <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                        <div>
                          <Text strong style={{ color: '#52c41a' }}>{voucherApplied.name}</Text>
                          <br />
                          <Text type="secondary">Mã: {voucherApplied.code}</Text>
                          <br />
                          <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                            -{voucherApplied.discountAmount.toLocaleString('vi-VN')} ₫
                          </Text>
                        </div>
                      </Space>
                    </Col>
                    <Col>
                      <Button danger size="small" onClick={handleRemoveVoucher}>
                        Xoá voucher
                      </Button>
                    </Col>
                  </Row>
                </Card>
              )}
              <Divider />
              <Text type="secondary">
                Mẹo: Bạn có thể tìm mã giảm giá tại trang Khuyến mãi hoặc từ các chương trình ưu đãi.
              </Text>
            </div>
          )}
          {currentStep === 2 && (
            <Spin spinning={orderLoading}>
              <div>
                <Title level={4}>3. Xác nhận đơn hàng</Title>
                <Card size="small">
                  <p><strong>Người nhận:</strong> {shippingInfo.name}</p>
                  <p><strong>Số điện thoại:</strong> {shippingInfo.phone}</p>
                  <p><strong>Địa chỉ:</strong> {shippingInfo.address}</p>
                  <p><strong>Thanh toán:</strong> {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</p>
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
                  <Row justify="space-between" style={{ marginBottom: 4 }}>
                    <Text>Tạm tính:</Text>
                    <Text>{totalPrice.toLocaleString('vi-VN')} ₫</Text>
                  </Row>
                  {discountAmount > 0 && (
                    <Row justify="space-between" style={{ marginBottom: 4 }}>
                      <Text style={{ color: '#52c41a' }}>Giảm giá ({voucherApplied?.code}):</Text>
                      <Text strong style={{ color: '#52c41a' }}>-{discountAmount.toLocaleString('vi-VN')} ₫</Text>
                    </Row>
                  )}
                  <Row justify="space-between" style={{ marginBottom: 4 }}>
                    <Text>Phí vận chuyển:</Text>
                    <Text>{shippingFee.toLocaleString('vi-VN')} ₫</Text>
                  </Row>
                  <Divider style={{ margin: '8px 0' }} />
                  <Row justify="space-between">
                    <Text strong>Tổng cộng:</Text>
                    <Title level={4} style={{ margin: 0, color: '#0052D9' }}>{finalPrice.toLocaleString('vi-VN')} ₫</Title>
                  </Row>
                </Card>
              </div>
            </Spin>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CartPage;
