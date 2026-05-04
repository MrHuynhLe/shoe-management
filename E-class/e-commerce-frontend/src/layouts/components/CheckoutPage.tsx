import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
} from "antd";
import { Popconfirm } from "antd";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  TruckOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { orderService } from "@/services/order.service";
import { useAuth } from "@/services/AuthContext";
import { discountService } from "@/services/discount.service";
import { userService } from "@/services/userService";
import { shippingService } from "@/services/shipping.service";
import { couponService } from "@/services/coupon.service";

interface Address {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  note?: string;
}

const { Title, Text } = Typography;

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [appliedVoucherInfo, setAppliedVoucherInfo] = useState<any>(null);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [isEstimatingShipping, setIsEstimatingShipping] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { isAuthenticated } = useAuth();
  const { items, subtotal } = location.state || { items: [], subtotal: 0 };

  const total = subtotal + shippingFee - discount;

  const formatMoney = (value?: number | string) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} ₫`;

  const buildVoucherLabel = (v: any) => {
    const discountText =
      v.discountType === "PERCENTAGE"
        ? `Giảm ${v.discountValue}%${v.maxDiscountAmount
          ? `, tối đa ${formatMoney(v.maxDiscountAmount)}`
          : ""
        }`
        : `Giảm ${formatMoney(v.discountValue)}`;

    const minOrderText =
      v.minOrderValue != null
        ? `, đơn tối thiểu ${formatMoney(v.minOrderValue)}`
        : "";

    const remainingText =
      v.remainingUsage != null
        ? `, còn ${v.remainingUsage} lượt`
        : v.usageLimit != null
          ? `, tổng ${v.usageLimit} lượt`
          : "";

    return `${v.code || v.name} - ${discountText}${minOrderText}${remainingText}`;
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        let coupons: any[] = [];

        if (isAuthenticated) {
          const couponsRes = await couponService.getMyCoupons();
          coupons =
            couponsRes.data?.map((c: any) => ({
              ...c,
              type: "COUPON",
            })) || [];
        }

        setAvailableVouchers(coupons);
      } catch (error) {
        console.error("Không thể tải danh sách voucher:", error);
        setAvailableVouchers([]);
      }
    };

    fetchVouchers();
  }, [isAuthenticated]);

  const loadUserAddresses = async () => {
    if (addresses.length === 0) {
      try {
        const response = await orderService.getUserShippingAddresses();
        setAddresses(response.data);
      } catch (error) {
        console.error("Không thể tải danh sách địa chỉ:", error);
      }
    }
  };

  const handleAddressSelect = (address: Address) => {
    form.setFieldsValue({
      customerName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      address: address.address,
      note: address.note,
    });
    setSelectedAddress(address);
    setIsAddressModalVisible(false);
    setTimeout(() => estimateShippingCost(), 100);
  };

  const handleNewAddress = () => {
    setIsAddressModalVisible(false);
  };

  const handleAddressFieldChange = () => {
    estimateShippingCost();
  };

  const estimateShippingCost = async () => {
    const { address, province, district, ward } = form.getFieldsValue([
      "address",
      "province",
      "district",
      "ward",
    ]);

    if (!province || !district || !ward || items.length === 0) {
      setShippingFee(0);
      return;
    }

    setIsEstimatingShipping(true);
    try {
      const shippingEstimateRequest = {
        shippingInfo: {
          province,
          district,
          address,
        },
        items: items.map((item: any) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const response = await shippingService.estimateShippingFee(
        shippingEstimateRequest,
      );
      setShippingFee(response.data.shippingFee);
    } catch (error) {
      message.error(
        "Không thể ước tính phí vận chuyển. Vui lòng kiểm tra địa chỉ.",
      );
      setShippingFee(0);
    } finally {
      setIsEstimatingShipping(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const initData = async () => {
        try {
          // Tải danh sách địa chỉ
          const addrResponse = await orderService.getUserShippingAddresses();
          const fetchedAddresses = addrResponse.data;
          setAddresses(fetchedAddresses || []);

          if (fetchedAddresses && fetchedAddresses.length > 0) {
            // Chọn địa chỉ đầu tiên (mới nhất) làm mặc định
            const latestAddress = fetchedAddresses[0];
            form.setFieldsValue({
              customerName: latestAddress.fullName,
              phone: latestAddress.phone,
              province: latestAddress.province,
              district: latestAddress.district,
              ward: latestAddress.ward,
              address: latestAddress.address,
              note: latestAddress.note,
            });
            setSelectedAddress(latestAddress);
            // Cập nhật phí vận chuyển sau khi điền form
            setTimeout(() => estimateShippingCost(), 100);
          } else {
            // Nếu không có địa chỉ nào, tải thông tin cơ bản từ profile
            const profileResponse = await userService.getProfile();
            const profile = profileResponse.data;
            if (profile) {
              form.setFieldsValue({
                customerName: profile.fullName,
                phone: profile.phone,
                province: profile.province,
                district: profile.district,
              });
            }
          }
        } catch (err) {
          console.error("Không thể tải dữ liệu khởi tạo:", err);
        }
      };

      initData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, form]);

  const handleApplyVoucher = async () => {
    if (!voucherCode) {
      message.warning("Vui lòng nhập mã giảm giá.");
      return;
    }

    try {
      const response = await discountService.validateVoucher(
        voucherCode,
        subtotal,
      );
      const { discountAmount, message: successMessage } = response.data;

      setDiscount(discountAmount);
      setAppliedVoucher(voucherCode);
      setAppliedVoucherInfo(response.data);

      message.success(
        successMessage || `Áp dụng mã "${voucherCode}" thành công!`,
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Mã giảm giá không hợp lệ hoặc đã xảy ra lỗi.";
      message.error(errorMessage);
    }
  };

  const handlePlaceOrder = async (values: any) => {
    const orderData = {
      shippingInfo: {
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
        province: values.province,
        district: values.district,
        ward: values.ward,
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

    if (values.paymentMethod === "VNPAY") {
      await submitOrderAndRedirectVnpay(orderData);
      return;
    }

    await submitOrder(orderData);
  };

  const submitOrder = async (orderData: any) => {
    setLoading(true);
    try {
      await orderService.placeOrder(orderData);

      setDiscount(0);
      setAppliedVoucher(null);
      setAppliedVoucherInfo(null);
      setVoucherCode("");

      message.success("Đặt hàng thành công!");
      navigate("/cart?tab=pending");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.";
      message.error(errorMessage);
      console.error("Failed to place order:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitOrderAndRedirectVnpay = async (orderData: any) => {
    setLoading(true);
    try {
      const placeOrderResponse = await orderService.placeOrder(orderData);
      const createdOrder = placeOrderResponse.data;

      const vnpayResponse = await orderService.createOnlineVnpayPayment(
        createdOrder.id,
      );

      const paymentUrl = vnpayResponse.data.paymentUrl;

      if (!paymentUrl) {
        throw new Error("Không tạo được link thanh toán VNPAY");
      }

      window.location.href = paymentUrl;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể khởi tạo thanh toán VNPAY.";
      message.error(errorMessage);
      console.error("Failed to create VNPAY payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/cart")}
        style={{ marginBottom: "24px" }}
      >
        Quay lại giỏ hàng
      </Button>

      <Title level={2} style={{ marginBottom: "24px" }}>
        Thanh toán
      </Title>

      <Form form={form} layout="vertical" onFinish={handlePlaceOrder}>
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={14}>
            <Card
              title="1. Thông tin giao hàng"
              bordered={false}
              style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              extra={isEstimatingShipping && <Spin size="small" />}
            >
              <Form.Item
                name="customerName"
                label="Họ và tên người nhận"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input placeholder="Ví dụ: 0123456789" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="province"
                    label="Tỉnh/Thành phố"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập Tỉnh/Thành phố!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Ví dụ: Hà Nội"
                      onChange={handleAddressFieldChange}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="district"
                    label="Quận/Huyện"
                    rules={[
                      { required: true, message: "Vui lòng nhập Quận/Huyện!" },
                    ]}
                  >
                    <Input
                      placeholder="Ví dụ: Quận Cầu Giấy"
                      onChange={handleAddressFieldChange}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="ward"
                    label="Phường/Xã"
                    rules={[
                      { required: true, message: "Vui lòng nhập Phường/Xã!" },
                    ]}
                  >
                    <Input
                      placeholder="Ví dụ: Phường Dịch Vọng"
                      onChange={handleAddressFieldChange}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="address"
                    label="Địa chỉ chi tiết"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ chi tiết!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Số nhà, tên đường"
                      onChange={handleAddressFieldChange}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  loadUserAddresses();
                  setIsAddressModalVisible(true);
                }}
                style={{ padding: 0, marginBottom: 16 }}
              >
                Chọn địa chỉ đã lưu
              </Button>

              <Form.Item name="note" label="Ghi chú cho đơn hàng (tùy chọn)">
                <Input.TextArea
                  rows={2}
                  placeholder="Ghi chú thêm cho người bán hoặc shipper"
                />
              </Form.Item>

              <Form.Item name="saveAddress" valuePropName="checked">
                <Checkbox>Lưu thông tin này cho lần mua sắm tiếp theo</Checkbox>
              </Form.Item>
            </Card>

            <Card
              title="Địa chỉ giao hàng"
              bordered={false}
              style={{
                marginTop: 24,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              {(() => {
                const values = form.getFieldsValue([
                  "customerName",
                  "phone",
                  "province",
                  "district",
                  "ward",
                  "address",
                ]);

                const hasCompleteAddress =
                  values.customerName &&
                  values.phone &&
                  values.province &&
                  values.district &&
                  values.ward &&
                  values.address;

                if (!hasCompleteAddress) {
                  return (
                    <Text type="secondary">
                      Vui lòng nhập thông tin giao hàng đầy đủ
                    </Text>
                  );
                }

                return (
                  <div style={{ lineHeight: "1.8" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text
                        strong
                        style={{ display: "inline-block", minWidth: "120px" }}
                      >
                        Người nhận:
                      </Text>
                      <Text>{values.customerName}</Text>
                    </div>

                    <div style={{ marginBottom: "8px" }}>
                      <Text
                        strong
                        style={{ display: "inline-block", minWidth: "120px" }}
                      >
                        Số điện thoại:
                      </Text>
                      <Text>{values.phone}</Text>
                    </div>

                    <div>
                      <Text
                        strong
                        style={{
                          display: "inline-block",
                          minWidth: "120px",
                          verticalAlign: "top",
                        }}
                      >
                        Địa chỉ:
                      </Text>
                      <Text
                        style={{
                          display: "inline-block",
                          maxWidth: "calc(100% - 120px)",
                        }}
                      >
                        {values.address}, {values.ward}, {values.district},{" "}
                        {values.province}
                      </Text>
                    </div>
                  </div>
                );
              })()}
            </Card>

            <Card
              title="2. Mã giảm giá"
              bordered={false}
              style={{
                marginTop: 24,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Space.Compact style={{ width: "100%" }}>
                <Select
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn hoặc nhập mã giảm giá"
                  value={voucherCode || undefined}
                  onSelect={(value) => {
                    setVoucherCode(value);
                  }}
                  onSearch={(value) => {
                    setVoucherCode(value);
                  }}
                  onChange={(value) => {
                    setVoucherCode(value || "");
                    if (!value) {
                      setDiscount(0);
                      setAppliedVoucher(null);
                      setAppliedVoucherInfo(null);
                    }
                  }}
                  filterOption={(input, option) =>
                    String(option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={availableVouchers.map((v) => ({
                    label: buildVoucherLabel(v),
                    value: v.code,
                  }))}
                  notFoundContent={
                    isAuthenticated
                      ? "Bạn không có mã giảm giá nào"
                      : "Đăng nhập để xem mã giảm giá của bạn"
                  }
                />

                <Button
                  type="primary"
                  onClick={handleApplyVoucher}
                  disabled={!!appliedVoucher || !voucherCode}
                >
                  Áp dụng
                </Button>
              </Space.Compact>

              {appliedVoucher && (
                <div style={{ marginTop: "12px" }}>
                  <Text type="success">
                    Đã áp dụng mã: <strong>{appliedVoucher}</strong>
                  </Text>

                  {appliedVoucherInfo && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        {buildVoucherLabel(appliedVoucherInfo)}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card
              title="3. Phương thức thanh toán"
              bordered={false}
              style={{
                marginTop: 24,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Form.Item
                name="paymentMethod"
                initialValue="CASH"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn phương thức thanh toán!",
                  },
                ]}
              >
                <Radio.Group style={{ width: "100%" }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Radio
                      value="CASH"
                      style={{
                        border: "1px solid #d9d9d9",
                        padding: "16px",
                        borderRadius: "8px",
                        width: "100%",
                      }}
                    >
                      <TruckOutlined style={{ marginRight: 8 }} />
                      Thanh toán khi nhận hàng (COD)
                    </Radio>

                    <Radio
                      value="VNPAY"
                      style={{
                        border: "1px solid #d9d9d9",
                        padding: "16px",
                        borderRadius: "8px",
                        width: "100%",
                      }}
                    >
                      <CreditCardOutlined style={{ marginRight: 8 }} />
                      Thanh toán online qua VNPAY
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              title={`Đơn hàng (${items.length} sản phẩm)`}
              bordered={false}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                position: "sticky",
                top: 24,
              }}
            >
              <Spin spinning={loading}>
                <List
                  itemLayout="horizontal"
                  dataSource={items}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar shape="square" size={64} src={item.image} />
                        }
                        title={<Text>{item.name}</Text>}
                        description={
                          <Row justify="space-between">
                            <Col>
                              <Text type="secondary">SL: {item.quantity}</Text>
                            </Col>
                            <Col>
                              <Text strong>
                                {(item.price * item.quantity).toLocaleString(
                                  "vi-VN",
                                )}{" "}
                                ₫
                              </Text>
                            </Col>
                          </Row>
                        }
                      />
                    </List.Item>
                  )}
                />

                <Divider />

                <Row justify="space-between" style={{ marginBottom: 12 }}>
                  <Text>Tạm tính</Text>
                  <Text strong>{subtotal.toLocaleString("vi-VN")} ₫</Text>
                </Row>

                <Row justify="space-between" style={{ marginBottom: 12 }}>
                  <Text>Phí vận chuyển</Text>
                  <Text strong>{shippingFee.toLocaleString("vi-VN")} ₫</Text>
                </Row>

                {discount > 0 && (
                  <Row justify="space-between" style={{ marginBottom: 12 }}>
                    <Text type="success">Giảm giá</Text>
                    <Text strong type="success">
                      - {discount.toLocaleString("vi-VN")} ₫
                    </Text>
                  </Row>
                )}

                {appliedVoucher && (
                  <Row justify="space-between" style={{ marginBottom: 12 }}>
                    <Text>Mã đã dùng</Text>
                    <Text strong>
                      <Tag color="green">{appliedVoucher}</Tag>
                    </Text>
                  </Row>
                )}

                <Divider />

                <Row justify="space-between">
                  <Title level={4} style={{ margin: 0 }}>
                    Tổng cộng
                  </Title>
                  <Title level={4} style={{ margin: 0, color: "#c81d1d" }}>
                    {total.toLocaleString("vi-VN")} ₫
                  </Title>
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
                    style={{ marginTop: "24px" }}
                  >
                    {loading ? "Đang xử lý..." : "Hoàn tất đặt hàng"}
                  </Button>
                </Popconfirm>
              </Spin>
            </Card>
          </Col>
        </Row>
      </Form>

      <Modal
        title="Chọn địa chỉ giao hàng"
        open={isAddressModalVisible}
        onCancel={() => setIsAddressModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={handleNewAddress}
            style={{ marginBottom: 16 }}
          >
            Nhập địa chỉ mới
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Text type="secondary">Không có địa chỉ đã lưu</Text>
          </div>
        ) : (
          <List
            dataSource={addresses}
            renderItem={(address) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    onClick={() => handleAddressSelect(address)}
                    disabled={
                      selectedAddress?.fullName === address.fullName &&
                      selectedAddress?.phone === address.phone
                    }
                  >
                    Chọn
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={`${address.fullName} - ${address.phone}`}
                  description={`${address.address}${address.ward ? `, ${address.ward}` : ""
                    }${address.district ? `, ${address.district}` : ""}${address.province ? `, ${address.province}` : ""
                    }`}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default CheckoutPage;