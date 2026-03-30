import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { useAuth } from '@/services/AuthContext'; // Import useAuth
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import {
  PosOrderItemResponse,
  PosOrderResponse,
  PosProductSearchResponse,
  posService,
} from '@/services/pos.services';
import { promotionService } from '@/services/promotion.service';
import { couponService } from '@/services/coupon.service';
import dayjs from 'dayjs';
//} from '@/services/pos.services';

const { Title, Text } = Typography;

const DEFAULT_STORE_ID = 1;

const paymentOptions = [
  { label: 'Tiền mặt', value: 1 },
  { label: 'Chuyển khoản', value: 2 },
  { label: 'MoMo', value: 3 },
];

const currency = (value?: number | null) =>
  new Intl.NumberFormat('vi-VN').format(value ?? 0);
const PosManagement = () => {
  const { user } = useAuth(); // Get user from AuthContext

  const [draftOrders, setDraftOrders] = useState<PosOrderResponse[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PosOrderResponse | null>(null);

  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<PosProductSearchResponse[]>([]);
  const [searching, setSearching] = useState(false);

  const [creating, setCreating] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>('');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
  const [customerIdInput, setCustomerIdInput] = useState<number | null>(1);
  const [checkoutData, setCheckoutData] = useState({
    paymentMethodId: 1,
    customerPaid: 0,
    discountAmount: 0,
    note: '',
  });

  const loadOrderDetail = async (orderId: number) => {
    try {
      setLoadingOrder(true);
      const data = await posService.getOrderDetail(orderId);
      setSelectedOrder(data);
      setCustomerIdInput(data.customerId ?? null);
      setCheckoutData((prev) => ({
        ...prev,
        discountAmount: data.discountAmount ?? 0,
        customerPaid: data.finalAmount ?? 0,
        note: data.note || '',
      }));
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không tải được chi tiết hóa đơn');
    } finally {
      setLoadingOrder(false);
    }
  };

  const buildVoucherLabel = (v: any) => {
    const discountText =
      v.discountType === 'PERCENTAGE'
        ? `Giảm ${v.discountValue}%${v.maxDiscountAmount ? `, tối đa ${currency(v.maxDiscountAmount)}` : ''}`
        : `Giảm ${currency(v.discountValue)}`;

    const minOrderText =
      v.minOrderValue != null ? `, đơn tối thiểu ${currency(v.minOrderValue)}` : '';

    const remainingText =
      v.remainingUsage != null
        ? `, còn ${v.remainingUsage} lượt`
        : v.usageLimit != null
          ? `, tổng ${v.usageLimit} lượt`
          : '';

    return `${v.code || v.name} - ${discountText}${minOrderText}${remainingText}`;
  };

  const fetchAndFilterVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const promotionsRes = await promotionService.getAll({ page: 0, size: 50 });
      const promotions = promotionsRes.data.content?.map((p: any) => ({ ...p, type: 'PROMOTION' })) || [];

      const couponsRes = await couponService.getAll({ page: 0, size: 50 }); // Assuming POS can access all coupons
      const coupons = couponsRes.data.content?.map((c: any) => ({ ...c, type: 'COUPON' })) || [];

      const allVouchers = [...promotions, ...coupons];

      const filtered = allVouchers.filter(v => {
        const now = dayjs();
        const isActive = v.isActive;
        const isPromotionValidTime = v.type === 'PROMOTION'
          ? dayjs(v.startDate).isBefore(now) && dayjs(v.endDate).isAfter(now)
          : true; 
        const meetsMinOrder = selectedOrder?.totalAmount ? (v.minOrderValue ? selectedOrder.totalAmount >= v.minOrderValue : true) : false;

        return isActive && isPromotionValidTime && meetsMinOrder;
      });

      setAvailableVouchers(filtered);
    } catch (error) {
      console.error('Không thể tải danh sách voucher:', error);
      setAvailableVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  };

  useEffect(() => {
    handleSearchProducts(); 
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      loadOrderDetail(selectedOrderId);
    }
    setAppliedVoucherCode(selectedOrder?.voucherCode || null);
  }, [selectedOrderId, selectedOrder?.voucherCode]); 

  const handleCreateOrder = async () => {
    setVoucherCodeInput('');
    setAppliedVoucherCode(null);

    try {
      if (!user?.userId) {
        message.error('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
        return;
      }

      setCreating(true);
      const data = await posService.createOrder({
        employeeId: user.userId, 
        customerId: 1,
        storeId: DEFAULT_STORE_ID,
        orderType: 'POS', 
        note: 'Khách mua tại quầy',
      });

      message.success('Tạo hóa đơn nháp thành công');
      setSelectedOrderId(data.orderId);
      setSelectedOrder(data);
      fetchAndFilterVouchers(); 
      message.success('Tạo hóa đơn tại quầy thành công');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không tạo được hóa đơn');
    } finally {
      setCreating(false);
    }
  };

  const handleSearchProducts = async () => {
    try {
      setSearching(true);
      const data = await posService.searchProducts(keyword);
      const sortedData = data.sort((a, b) => b.stockQuantity - a.stockQuantity);
      setProducts(sortedData); 

    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không tìm được sản phẩm');
    } finally {
      setSearching(false);
    }
  };

  const handleAddProduct = async (productVariantId: number) => {
    if (!selectedOrderId) {
      message.warning('Hãy tạo hoặc chọn hóa đơn trước');
      return;
    }

    try {
      const data = await posService.addItem(selectedOrderId, {
        productVariantId,
        quantity: 1,
      });
      setSelectedOrder(data);
      message.success('Đã thêm sản phẩm vào hóa đơn');
      fetchAndFilterVouchers(); 
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Thêm sản phẩm thất bại');
    }
  };

  const handleUpdateQuantity = async (item: PosOrderItemResponse, quantity: number | null) => {
    if (!selectedOrderId || !quantity || quantity < 1) return;

    try {
      const data = await posService.updateItem(selectedOrderId, item.itemId, { quantity });
      setSelectedOrder(data);
      // No need to load draft orders, selected order is updated
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật số lượng thất bại');
    } finally {
      fetchAndFilterVouchers();
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!selectedOrderId) return;

    try {
      const data = await posService.removeItem(selectedOrderId, itemId);
      setSelectedOrder(data);
      message.success('Đã xóa sản phẩm');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa sản phẩm thất bại'); 
    } finally {
      fetchAndFilterVouchers();
    }
  };
  const handleAssignCustomer = async () => {
    if (!selectedOrderId) return; 

    try {
      const data = await posService.assignCustomer(selectedOrderId, {
        customerId: customerIdInput,
      });
      setSelectedOrder(data);
      message.success('Cập nhật khách hàng thành công');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật khách hàng thất bại');
    }
  };

  const handleCheckout = async () => {
    if (!selectedOrderId || !selectedOrder) return;

    try {
      await posService.checkout(selectedOrderId, {
        paymentMethodId: checkoutData.paymentMethodId,
        customerPaid: checkoutData.customerPaid,
        discountAmount: checkoutData.discountAmount,
        note: checkoutData.note,
      });

      message.success('Thanh toán thành công');
      setCheckoutOpen(false);
      setSelectedOrder(null);
      setVoucherCodeInput('');
      setAppliedVoucherCode(null);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Checkout thất bại');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;

    try {
      await posService.cancelOrder(selectedOrderId);
      message.success('Hủy hóa đơn thành công');
      setSelectedOrder(null); 
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Hủy hóa đơn thất bại');
    } finally {
      setVoucherCodeInput('');
      setAppliedVoucherCode(null);
    }
  };

  const handleApplyVoucher = async () => {
    if (!selectedOrder?.orderId) {
      message.warning('Hãy tạo hoặc chọn hóa đơn trước');
      return;
    }
    if (!voucherCodeInput) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }
    try {
      const data = await posService.applyVoucher(selectedOrder.orderId, {
        voucherCode: voucherCodeInput,
      });
      setSelectedOrder(data);
      setAppliedVoucherCode(voucherCodeInput);
      message.success(`Áp dụng mã giảm giá "${voucherCodeInput}" thành công!`);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Áp dụng mã giảm giá thất bại');
    }
  };

  const handleRemoveVoucher = async () => {
    if (!selectedOrder?.orderId) return;

    try {
      const data = await posService.removeVoucher(selectedOrder.orderId);
      setSelectedOrder(data);
      setAppliedVoucherCode(null);
      setVoucherCodeInput('');
      message.success('Đã hủy mã giảm giá');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Hủy mã giảm giá thất bại');
    }
  };



  const orderColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (_: any, record: PosOrderItemResponse) => (
        <Space align="start">
          <img
            src={record.imageUrl || 'https://via.placeholder.com/56'}
            alt={record.productName}
            style={{
              width: 56,
              height: 56,
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
            }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{record.productName}</div>
            <div>Mã: {record.variantCode}</div>
            <div>Barcode: {record.barcode || '-'}</div>
            <div>
              {record.color ? `Màu: ${record.color}` : ''} {record.size ? `- Size: ${record.size}` : ''}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      render: (value: number) => `${currency(value)} đ`,
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (_: any, record: PosOrderItemResponse) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleUpdateQuantity(record, value)}
        />
      ),
    },
    {
      title: 'Tồn',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 80,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      width: 150,
      render: (value: number) => `${currency(value)} đ`,
    },
    {
      title: '',
      key: 'action',
      width: 70,
      render: (_: any, record: PosOrderItemResponse) => (
        <Popconfirm
          title="Xóa sản phẩm này?"
          onConfirm={() => handleRemoveItem(record.itemId)}
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const productColumns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (value: string) => (
        <img
          src={value || 'https://via.placeholder.com/56'}
          alt="sp"
          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }}
        />
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (_: any, record: PosProductSearchResponse) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.productName}</div>
          <div>{record.variantCode}</div>
          <div>Barcode: {record.barcode || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Tồn',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 80,
    },
    {
      title: 'Giá',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      width: 140,
      render: (value: number) => `${currency(value)} đ`,
    },
    {
      title: '',
      key: 'action',
      width: 90,
      render: (_: any, record: PosProductSearchResponse) => (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAddProduct(record.productVariantId)}
        >
          Thêm
        </Button>
      ),
    },
  ];

  const summary = useMemo(() => {
    if (!selectedOrder) {
      return {
        total: 0,
        discount: 0,
        final: 0,
      };
    }
    return {
      total: selectedOrder.totalAmount || 0,
      discount: selectedOrder.discountAmount || 0,
      final: selectedOrder.finalAmount || 0,
    };
  }, [selectedOrder]);

  return (
    <div style={{ padding: 20 }}>
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={creating}
            onClick={handleCreateOrder}
          >
            Tạo hóa đơn mới
          </Button>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={10}>
          <Card
            title="Danh sách sản phẩm"
            extra={
              <Space>
                <Input
                  placeholder="Tìm theo tên, mã, barcode..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={handleSearchProducts}
                  style={{ width: 260 }}
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  loading={searching}
                  onClick={handleSearchProducts}
                >
                  Tìm
                </Button>
              </Space>
            }
          >
            <Table
              rowKey="productVariantId"
              columns={productColumns}
              dataSource={products}
              loading={searching}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>

        <Col span={14}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Hóa đơn đang chọn</span>
              </Space>
            }
            loading={loadingOrder}
          >
            {!selectedOrder ? (
              <Empty description="Chưa chọn hóa đơn" />
            ) : (
              <>
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <div>
                    <Text strong>Mã hóa đơn:</Text> {selectedOrder.orderCode}
                  </div>
                  {selectedOrder.employeeId && (
                    <div>
                      <Text strong>ID NV tạo:</Text> {selectedOrder.employeeId}
                    </div>
                  )}
                  {selectedOrder.employeeName && (
                    <div>
                      <Text strong>Tên NV tạo:</Text> {selectedOrder.employeeName}
                    </div>
                  )}
              

                  <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    <Text strong>Mã giảm giá:</Text>
                    <Space.Compact style={{ width: '100%' }}>
                      <Select
                        showSearch
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Chọn hoặc nhập mã giảm giá"
                        value={voucherCodeInput || undefined}
                        onSelect={(value) => setVoucherCodeInput(value)}
                        onSearch={(value) => setVoucherCodeInput(value)}
                        onChange={(value) => setVoucherCodeInput(value || '')}
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={availableVouchers.map((v) => ({ label: buildVoucherLabel(v), value: v.code }))}
                        disabled={!!appliedVoucherCode}
                        loading={loadingVouchers}
                      />
                      <Button type="primary" onClick={handleApplyVoucher} disabled={!!appliedVoucherCode || !voucherCodeInput}>
                        Áp dụng
                      </Button>
                    </Space.Compact>
                    {appliedVoucherCode && (
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text type="success">Đã áp dụng: <Tag color="green">{appliedVoucherCode}</Tag></Text>
                        <Button type="link" danger onClick={handleRemoveVoucher}>
                          Hủy voucher
                        </Button>
                      </Space>
                    )}
                  </Space>


                  <Table
                    rowKey="itemId"
                    columns={orderColumns}
                    dataSource={selectedOrder.items || []}
                    pagination={false}
                    scroll={{ y: 300 }}
                    locale={{ emptyText: 'Chưa có sản phẩm' }}
                  />

                  <Card size="small">
                    <Row justify="space-between">
                      <Text>Tạm tính</Text>
                      <Text>{currency(summary.total)} đ</Text>
                    </Row>
                    <Row justify="space-between">
                      <Text>Giảm giá</Text>
                      <Text>{currency(summary.discount)} đ</Text>
                    </Row>
                    <Row justify="space-between">
                      <Title level={5} style={{ margin: 0 }}>Cần thanh toán</Title>
                      <Title level={5} style={{ margin: 0, color: '#cf1322' }}>
                        {currency(summary.final)} đ
                      </Title>
                    </Row>
                  </Card>

                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Popconfirm
                      title="Bạn chắc chắn muốn hủy hóa đơn?"
                      onConfirm={handleCancelOrder}
                    >
                      <Button danger>Hủy hóa đơn</Button>
                    </Popconfirm>

                    <Button
                      type="primary"
                      onClick={() => {
                        setCheckoutData((prev) => ({
                          ...prev,
                          customerPaid: selectedOrder.finalAmount || 0,
                          discountAmount: selectedOrder.discountAmount || 0,
                        }));
                        setCheckoutOpen(true);
                      }}
                      disabled={!selectedOrder.items?.length}
                    >
                      Thanh toán
                    </Button>
                  </Space>
                </Space>
              </>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Thanh toán hóa đơn"
        open={checkoutOpen}
        onCancel={() => setCheckoutOpen(false)}
        onOk={handleCheckout}
        okText="Xác nhận thanh toán"
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <div>
            <Text strong>Tổng tiền:</Text> {currency(selectedOrder?.totalAmount || 0)} đ
          </div>

          <div>
            <Text strong>Giảm giá</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 6 }}
              min={0}
              value={checkoutData.discountAmount}
              onChange={(value) =>
                setCheckoutData((prev) => ({
                  ...prev,
                  discountAmount: Number(value || 0),
                }))
              }
            />
          </div>

          <div>
            <Text strong>Phương thức thanh toán</Text>
            <Select
              style={{ width: '100%', marginTop: 6 }}
              options={paymentOptions}
              value={checkoutData.paymentMethodId}
              onChange={(value) =>
                setCheckoutData((prev) => ({ ...prev, paymentMethodId: value }))
              }
            />
          </div>

          <div>
            <Text strong>Tiền khách đưa</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 6 }}
              min={0}
              value={checkoutData.customerPaid}
              onChange={(value) =>
                setCheckoutData((prev) => ({
                  ...prev,
                  customerPaid: Number(value || 0),
                }))
              }
            />
          </div>

          <div>
            <Text strong>Ghi chú</Text>
            <Input.TextArea
              rows={3}
              value={checkoutData.note}
              onChange={(e) =>
                setCheckoutData((prev) => ({ ...prev, note: e.target.value }))
              }
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default PosManagement;