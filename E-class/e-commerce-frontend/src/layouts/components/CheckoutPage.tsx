import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Radio,
  Button,
  List,
  Avatar,
  Divider,
  Typography,
  message,
  Spin,
  Space,
} from 'antd';
import { ArrowLeftOutlined, CreditCardOutlined, TruckOutlined } from '@ant-design/icons';
import { orderService } from '@/services/order.service';
import { discountService } from '@/services/discount.service';

const { Title, Text } = Typography;

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);

  const { items, subtotal } = location.state || { items: [], subtotal: 0 };

  const shippingFee = items.length > 0 ? 30000 : 0; 
  const total = subtotal + shippingFee - discount;

  useEffect(() => {

    if (!items || items.length === 0) {
      message.warning('Không có sản phẩm nào để thanh toán.');
      navigate('/cart', { replace: true });
    }
  }, [items, navigate]);

  const handleApplyVoucher = async () => {
    if (!voucherCode) {
      message.warning('Vui lòng nhập mã giảm giá.');
      return;
    }
    try {
      const response = await discountService.validateVoucher(voucherCode, subtotal);
      const { discountAmount, message: successMessage } = response.data;
      setDiscount(discountAmount);
      setAppliedVoucher(voucherCode);
      message.success(successMessage || `Áp dụng mã "${voucherCode}" thành công!`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã xảy ra lỗi.';
      message.error(errorMessage);
    }
  };

  const handlePlaceOrder = async (values: any) => {
    setLoading(true);
    const orderData = {
      shippingInfo: {
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
        note: values.note,
      },
      paymentMethodCode: values.paymentMethod,
      items: items.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      voucherCode: appliedVoucher,
    };

    console.log('Submitting order:', orderData);

    try {
      const response = await orderService.placeOrder(orderData);
      
      message.success('Đặt hàng thành công! Bạn sẽ được chuyển đến trang đơn hàng.');
      navigate('/my-orders', { replace: true });

    } catch (error: any) {
      message.error('Đặt hàng thất bại. Vui lòng thử lại.');
      console.error('Failed to place order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/cart')}
        style={{ marginBottom: '24px' }}
      >
        Quay lại giỏ hàng
      </Button>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Thanh toán
      </Title>
      <Form form={form} layout="vertical" onFinish={handlePlaceOrder}>
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={14}>
            <Card title="1. Thông tin giao hàng" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Form.Item name="customerName" label="Họ và tên người nhận" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                <Input placeholder="09xxxxxxxx" />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ nhận hàng" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
                <Input.TextArea rows={3} placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú cho đơn hàng (tùy chọn)">
                <Input.TextArea rows={2} placeholder="Ghi chú thêm cho người bán hoặc shipper" />
              </Form.Item>
            </Card>
            <Card title="2. Mã giảm giá" bordered={false} style={{ marginTop: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  disabled={!!appliedVoucher}
                />
                <Button type="primary" onClick={handleApplyVoucher} disabled={!!appliedVoucher}>
                  Áp dụng
                </Button>
              </Space.Compact>
              {appliedVoucher && (
                <div style={{ marginTop: '12px' }}>
                  <Text type="success">Đã áp dụng mã: <strong>{appliedVoucher}</strong></Text>
                  <Button type="link" danger onClick={() => {
                    setVoucherCode(''); setDiscount(0); setAppliedVoucher(null);
                  }}>Xóa</Button>
                </div>
              )}
            </Card>
            <Card title="3. Phương thức thanh toán" bordered={false} style={{ marginTop: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Form.Item name="paymentMethod" initialValue="COD" rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}>
                <Radio.Group style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="COD" style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '8px', width: '100%' }}>
                      <TruckOutlined style={{ marginRight: 8 }} />
                      Thanh toán khi nhận hàng (COD)
                    </Radio>
                    <Radio value="BANK_TRANSFER" style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '8px', width: '100%' }}>
                      <CreditCardOutlined style={{ marginRight: 8 }} />
                      Chuyển khoản ngân hàng
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title={`Đơn hàng (${items.length} sản phẩm)`} bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 24 }}>
              <Spin spinning={loading}>
                <List
                  itemLayout="horizontal"
                  dataSource={items}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar shape="square" size={64} src={item.image} />}
                        title={<Text>{item.name}</Text>}
                        description={
                          <Row justify="space-between">
                            <Col><Text type="secondary">SL: {item.quantity}</Text></Col>
                            <Col><Text strong>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</Text></Col>
                          </Row>
                        }
                      />
                    </List.Item>
                  )}
                />
                <Divider />
                <Row justify="space-between" style={{ marginBottom: 12 }}>
                  <Text>Tạm tính</Text>
                  <Text strong>{subtotal.toLocaleString('vi-VN')} ₫</Text>
                </Row>
                <Row justify="space-between" style={{ marginBottom: 12 }}>
                  <Text>Phí vận chuyển</Text>
                  <Text strong>{shippingFee.toLocaleString('vi-VN')} ₫</Text>
                </Row>
                {discount > 0 && (
                  <Row justify="space-between" style={{ marginBottom: 12 }}>
                    <Text type="success">Giảm giá</Text>
                    <Text strong type="success">- {discount.toLocaleString('vi-VN')} ₫</Text>
                  </Row>
                )}
                <Divider />
                <Row justify="space-between">
                  <Title level={4} style={{ margin: 0 }}>Tổng cộng</Title>
                  <Title level={4} style={{ margin: 0, color: '#c81d1d' }}>{total.toLocaleString('vi-VN')} ₫</Title>
                </Row>
                <Button
                  type="primary"
                  danger
                  block
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  style={{ marginTop: '24px' }}
                >
                  {loading ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
                </Button>
              </Spin>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CheckoutPage;