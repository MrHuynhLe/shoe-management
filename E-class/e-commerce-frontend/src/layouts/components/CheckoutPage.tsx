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
  Checkbox,
  Divider,
  Typography,
  message,
  Spin,
  Space,
  Select,
  Tag,
  Modal,
  Image,
  Descriptions,
} from 'antd';
import { Popconfirm } from 'antd';
import { ArrowLeftOutlined, CreditCardOutlined, TruckOutlined } from '@ant-design/icons';
import { orderService } from '@/services/order.service';
import { useAuth } from '@/services/AuthContext';
import { discountService } from '@/services/discount.service';
import { userService } from '@/services/userService';
import { promotionService } from '@/services/promotion.service';
import { couponService } from '@/services/coupon.service';

const { Title, Text } = Typography;

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  const { isAuthenticated } = useAuth();

  const { items, subtotal } = location.state || { items: [], subtotal: 0 };

  const shippingFee = items.length > 0 ? 30000 : 0; 
  const total = subtotal + shippingFee - discount;

  const generateVietQRUrl = (amount: number, note: string) => {
    const bankId = "VCB"; 
    const accountNumber = "1234567890";
    const accountName = "CONG TY TNHH ABC";
    const template = "compact2"; 
    const encodedNote = encodeURIComponent(note);
    const encodedAccountName = encodeURIComponent(accountName);

    return `https://img.vietqr.io/image/${bankId}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodedNote}&accountName=${encodedAccountName}`;
  };


  useEffect(() => {

    if (!items || items.length === 0) {
      message.warning('Không có sản phẩm nào để thanh toán.');
      navigate('/cart', { replace: true });
    }
  }, [items, navigate]);
  useEffect(() => {
    if (isAuthenticated) {
      userService.getProfile()
        .then(response => {
          const profile = response.data;
          if (profile) {
            form.setFieldsValue({
              customerName: profile.fullName,
              phone: profile.phone,
              address: profile.address,
            });
          }
        })
        .catch(err => console.error("Không thể tải thông tin người dùng:", err));
    }
  }, [isAuthenticated, form]);

  useEffect(() => {
    setAvailableVouchers([]);

    const fetchAvailableVouchers = async () => {
      try {
        const response = await promotionService.getPublicPromotions({ page: 0, size: 50 });
        const promotions = response.data.content.map((p: any) => ({ ...p, type: 'PROMOTION' })) || [];
        setAvailableVouchers(prev => [...promotions, ...prev.filter(v => v.type !== 'PROMOTION')]);
      } catch (error) {
        console.error("Không thể tải danh sách khuyến mãi:", error);
      }
    };

    const fetchMyCoupons = async () => {
      try {
        const response = await couponService.getMyCoupons();
        const coupons = response.data.map((c: any) => ({ ...c, type: 'COUPON' })) || [];
        setAvailableVouchers(prev => [...prev.filter(v => v.type !== 'COUPON'), ...coupons]);
      } catch (error) {
        console.error("Không thể tải danh sách coupon:", error);
      }
    };

    fetchAvailableVouchers();
    if (isAuthenticated) {
      fetchMyCoupons();
    }
  }, [isAuthenticated]);

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
    const orderData = {
      shippingInfo: {
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
        note: values.note,
      },
      shouldUpdateProfile: values.saveAddress,
      paymentMethodCode: values.paymentMethod,
      items: items.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      voucherCode: appliedVoucher,
    };

    if (values.paymentMethod === 'BANK') {
      setPendingOrderData(orderData);
      setIsBankModalVisible(true);
    } else {
      await submitOrder(orderData);
    }
  };
  const handleConfirmBankTransfer = async () => {
    setIsBankModalVisible(false);
    if (pendingOrderData) {
      await submitOrder(pendingOrderData);
    }
  };

  const submitOrder = async (orderData: any) => {
    setLoading(true);
    try {
      await orderService.placeOrder(orderData);
      message.success('Đặt hàng thành công!');
      navigate('/cart?tab=pending');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
      message.error(errorMessage);
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
          <Form.Item name="saveAddress" valuePropName="checked">
            <Checkbox>Lưu thông tin này cho lần mua sắm tiếp theo</Checkbox>
          </Form.Item>
            </Card>
            <Card title="2. Mã giảm giá" bordered={false} style={{ marginTop: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Space.Compact style={{ width: '100%' }}>
                <Select
                  showSearch
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Chọn hoặc nhập mã giảm giá"
                  value={voucherCode || undefined}
                  onSelect={(value) => { setVoucherCode(value); }}
                  onSearch={(value) => { setVoucherCode(value); }}
                  onChange={(value) => { 
                    setVoucherCode(value || '');
                    if (!value) {
                      setDiscount(0);
                      setAppliedVoucher(null);
                    }
                  }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={availableVouchers.map(v => ({
                    label: v.type === 'PROMOTION'
                      ? `${v.name} (Giảm ${v.discountValue}${v.discountType === 'PERCENTAGE' ? '%' : '₫'})`                      : `${v.name || v.code} (Giảm ${v.discountValue}${v.discountType === 'PERCENTAGE' ? '%' : '₫'})`,
                    value: v.code,
                  }))}
                  notFoundContent={isAuthenticated ? "Bạn không có mã giảm giá nào" : "Đăng nhập để xem mã giảm giá của bạn"}
                />
                <Button type="primary" onClick={handleApplyVoucher} disabled={!!appliedVoucher || !voucherCode}>
                  Áp dụng
                </Button>
              </Space.Compact>
              {appliedVoucher && (
                <div style={{ marginTop: '12px' }}>
                  <Text type="success">Đã áp dụng mã: <strong>{appliedVoucher}</strong></Text>
                </div>
              )}
            </Card>
            <Card title="3. Phương thức thanh toán" bordered={false} style={{ marginTop: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Form.Item name="paymentMethod" initialValue="CASH" rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}>
                <Radio.Group style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="CASH" style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '8px', width: '100%' }}>
                      <TruckOutlined style={{ marginRight: 8 }} />
                      Thanh toán khi nhận hàng (COD)
                    </Radio>
                    <Radio value="BANK" style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '8px', width: '100%' }}>
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
                {appliedVoucher && (
                  <Row justify="space-between" style={{ marginBottom: 12 }}>
                    <Text>Mã đã dùng</Text>
                    <Text strong><Tag color="green">{appliedVoucher}</Tag></Text>
                  </Row>
                )}
                <Divider />
                <Row justify="space-between">
                  <Title level={4} style={{ margin: 0 }}>Tổng cộng</Title>
                  <Title level={4} style={{ margin: 0, color: '#c81d1d' }}>{total.toLocaleString('vi-VN')} ₫</Title>
                </Row>
                <Popconfirm
                  title="Xác nhận đặt hàng?"
                  description="Vui lòng kiểm tra lại thông tin giao hàng và sản phẩm trước khi xác nhận."
                  onConfirm={() => form.submit()}
                  okText="Xác nhận"
                  cancelText="Xem lại"
                >
                  <Button
                    type="primary"
                    danger
                    block
                    size="large"
                    loading={loading}
                    style={{ marginTop: '24px' }}
                  >
                    {loading ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
                  </Button>
                </Popconfirm>
              </Spin>
            </Card>
          </Col>
        </Row>
      </Form>

      <Modal
        title="Thông tin chuyển khoản"
        open={isBankModalVisible}
        onCancel={() => setIsBankModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsBankModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleConfirmBankTransfer}>
            Tôi đã chuyển khoản
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center' }}>
          <p>Vui lòng quét mã QR hoặc chuyển khoản theo thông tin dưới đây.</p>
          <Image width={250} src={generateVietQRUrl(total, `DH ${pendingOrderData?.shippingInfo?.phone || ''}`)} preview={false} />
          <Descriptions bordered column={1} style={{ marginTop: 20 }}>
            <Descriptions.Item label="Ngân hàng">Vietcombank</Descriptions.Item>
            <Descriptions.Item label="Chủ tài khoản">CONG TY TNHH ABC</Descriptions.Item>
            <Descriptions.Item label="Số tài khoản">1234567890</Descriptions.Item>
            <Descriptions.Item label="Số tiền"><Text strong style={{color: '#c81d1d'}}>{total.toLocaleString('vi-VN')} ₫</Text></Descriptions.Item>
            <Descriptions.Item label="Nội dung chuyển khoản"><Text copyable strong>{`DH ${pendingOrderData?.shippingInfo?.phone}`}</Text></Descriptions.Item>
          </Descriptions>
          <Text type="danger" style={{ marginTop: 16, display: 'block' }}>Lưu ý: Vui lòng nhập chính xác nội dung chuyển khoản để đơn hàng được xác nhận tự động.</Text>
        </div>
      </Modal>
    </div>
  );
};

export default CheckoutPage;