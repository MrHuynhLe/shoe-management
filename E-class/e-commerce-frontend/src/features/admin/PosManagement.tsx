import { CSSProperties, useEffect, useMemo, useState } from "react";
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
} from "antd";
import {
  DeleteOutlined,
  GiftOutlined,
  PlusOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import {
  PosAvailableDiscountResponse,
  PosOrderItemResponse,
  PosOrderResponse,
  PosProductSearchResponse,
  posService,
} from "@/services/pos.services";

const { Title, Text } = Typography;

const DEFAULT_EMPLOYEE_ID = 2;
const DEFAULT_STORE_ID = 1;

const paymentOptions = [
  { label: "Tiền mặt", value: 1 },
  { label: "Chuyển khoản", value: 2 },
  { label: "MoMo", value: 3 },
];

const currency = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN").format(value ?? 0);

const formatUsageNumber = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "Không giới hạn";
  }

  return value.toLocaleString("vi-VN");
};

const formatUsagePercent = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${Number(value).toFixed(1)}%`;
};

const panelCardStyle: CSSProperties = {
  borderRadius: 16,
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
  border: "1px solid #f0f0f0",
};

const voucherCardBaseStyle: CSSProperties = {
  borderRadius: 12,
};

const PosManagement = () => {
  const [draftOrders, setDraftOrders] = useState<PosOrderResponse[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PosOrderResponse | null>(
    null,
  );

  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState<PosProductSearchResponse[]>([]);
  const [searching, setSearching] = useState(false);

  const [creating, setCreating] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerIdInput, setCustomerIdInput] = useState<number | null>(1);

  const [availableDiscounts, setAvailableDiscounts] = useState<
    PosAvailableDiscountResponse[]
  >([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [selectedDiscount, setSelectedDiscount] =
    useState<PosAvailableDiscountResponse | null>(null);

  const [checkoutData, setCheckoutData] = useState({
    paymentMethodId: 1,
    customerPaid: 0,
    note: "",
  });

  const loadDraftOrders = async () => {
    try {
      const data = await posService.getDraftOrders();
      setDraftOrders(data);

      if (data.length > 0) {
        const stillExists = data.some((o) => o.orderId === selectedOrderId);
        const nextId = stillExists ? selectedOrderId : data[0].orderId;
        setSelectedOrderId(nextId ?? null);
      } else {
        setSelectedOrderId(null);
        setSelectedOrder(null);
        setSelectedDiscount(null);
        setAvailableDiscounts([]);
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Không tải được hóa đơn nháp",
      );
    }
  };

  const loadOrderDetail = async (orderId: number) => {
    try {
      setLoadingOrder(true);
      const data = await posService.getOrderDetail(orderId);

      setSelectedOrder(data);
      setCustomerIdInput(data.customerId ?? null);
      setCheckoutData((prev) => ({
        ...prev,
        customerPaid: data.finalAmount ?? 0,
        note: data.note || "",
      }));

      await loadAvailableDiscounts(orderId);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Không tải được chi tiết hóa đơn",
      );
    } finally {
      setLoadingOrder(false);
    }
  };

  const loadAvailableDiscounts = async (orderId: number) => {
    try {
      setLoadingDiscounts(true);
      const data = await posService.getAvailableDiscounts(orderId);

      setAvailableDiscounts(data);

      if (selectedDiscount) {
        const stillExists = data.find(
          (item) =>
            item.voucherType === selectedDiscount.voucherType &&
            item.id === selectedDiscount.id,
        );

        if (!stillExists) {
          setSelectedDiscount(null);
        } else {
          setSelectedDiscount(stillExists);
        }
      }
    } catch (error: any) {
      setAvailableDiscounts([]);
      setSelectedDiscount(null);
      message.error(
        error?.response?.data?.message || "Không tải được danh sách voucher",
      );
    } finally {
      setLoadingDiscounts(false);
    }
  };

  useEffect(() => {
    loadDraftOrders();
    handleSearchProducts();
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      loadOrderDetail(selectedOrderId);
    }
  }, [selectedOrderId]);

  const handleCreateOrder = async () => {
    try {
      setCreating(true);

      const data = await posService.createOrder({
        employeeId: DEFAULT_EMPLOYEE_ID,
        customerId: 1,
        storeId: DEFAULT_STORE_ID,
        note: "Khách mua tại quầy",
      });

      message.success("Tạo hóa đơn nháp thành công");
      await loadDraftOrders();
      setSelectedOrderId(data.orderId);
      setSelectedOrder(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Không tạo được hóa đơn");
    } finally {
      setCreating(false);
    }
  };

  const handleSearchProducts = async () => {
    try {
      setSearching(true);
      const data = await posService.searchProducts(keyword);
      setProducts(data);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Không tìm được sản phẩm",
      );
    } finally {
      setSearching(false);
    }
  };

  const handleAddProduct = async (productVariantId: number) => {
    if (!selectedOrderId) {
      message.warning("Hãy tạo hoặc chọn hóa đơn trước");
      return;
    }

    try {
      const data = await posService.addItem(selectedOrderId, {
        productVariantId,
        quantity: 1,
      });

      setSelectedOrder(data);
      await loadDraftOrders();
      await loadAvailableDiscounts(selectedOrderId);
      message.success("Đã thêm sản phẩm vào hóa đơn");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Thêm sản phẩm thất bại");
    }
  };

  const handleUpdateQuantity = async (
    item: PosOrderItemResponse,
    quantity: number | null,
  ) => {
    if (!selectedOrderId || !quantity || quantity < 1) {
      return;
    }

    try {
      const data = await posService.updateItem(selectedOrderId, item.itemId, {
        quantity,
      });

      setSelectedOrder(data);
      await loadDraftOrders();
      await loadAvailableDiscounts(selectedOrderId);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Cập nhật số lượng thất bại",
      );
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!selectedOrderId) {
      return;
    }

    try {
      const data = await posService.removeItem(selectedOrderId, itemId);

      setSelectedOrder(data);
      await loadDraftOrders();
      await loadAvailableDiscounts(selectedOrderId);
      message.success("Đã xóa sản phẩm");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Xóa sản phẩm thất bại");
    }
  };

  const handleAssignCustomer = async () => {
    if (!selectedOrderId) {
      return;
    }

    try {
      const data = await posService.assignCustomer(selectedOrderId, {
        customerId: customerIdInput,
      });

      setSelectedOrder(data);
      setSelectedDiscount(null);
      await loadDraftOrders();
      await loadAvailableDiscounts(selectedOrderId);
      message.success("Cập nhật khách hàng thành công");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Cập nhật khách hàng thất bại",
      );
    }
  };

  const handleSelectDiscount = (discount: PosAvailableDiscountResponse) => {
    setSelectedDiscount(discount);
    setCheckoutData((prev) => ({
      ...prev,
      customerPaid: Math.max(
        (selectedOrder?.totalAmount ?? 0) -
          (discount.estimatedDiscountAmount ?? 0),
        0,
      ),
    }));

    message.success(`Đã chọn voucher ${discount.code}`);
  };

  const handleClearDiscount = () => {
    setSelectedDiscount(null);
    setCheckoutData((prev) => ({
      ...prev,
      customerPaid: selectedOrder?.totalAmount ?? 0,
    }));
  };

  const handleCheckout = async () => {
    if (!selectedOrderId) {
      message.warning("Chưa chọn hóa đơn");
      return;
    }

    try {
      const data = await posService.checkout(selectedOrderId, {
        paymentMethodId: checkoutData.paymentMethodId,
        customerPaid: checkoutData.customerPaid,
        couponId:
          selectedDiscount?.voucherType === "COUPON"
            ? selectedDiscount.id
            : null,
        promotionId:
          selectedDiscount?.voucherType === "PROMOTION"
            ? selectedDiscount.id
            : null,
        note: checkoutData.note,
      });

      message.success("Thanh toán thành công");
      setCheckoutOpen(false);
      setSelectedDiscount(null);
      setAvailableDiscounts([]);
      setSelectedOrder(data);
      await loadDraftOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Thanh toán thất bại");
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) {
      return;
    }

    try {
      await posService.cancelOrder(selectedOrderId);
      message.success("Hủy hóa đơn thành công");
      await loadDraftOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Hủy hóa đơn thất bại");
    }
  };

  const orderColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (_: any, record: PosOrderItemResponse) => (
        <Space align="start">
          <img
            src={record.imageUrl || "https://via.placeholder.com/56"}
            alt={record.productName}
            style={{
              width: 56,
              height: 56,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
            }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{record.productName}</div>
            <div>Mã: {record.variantCode}</div>
            <div>Barcode: {record.barcode || "-"}</div>
            <div>
              {record.color ? `Màu: ${record.color}` : ""}
              {record.size ? ` - Size: ${record.size}` : ""}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (value: number) => `${currency(value)} đ`,
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
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
      title: "Tồn",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 80,
    },
    {
      title: "Thành tiền",
      dataIndex: "lineTotal",
      key: "lineTotal",
      width: 150,
      render: (value: number) => `${currency(value)} đ`,
    },
    {
      title: "",
      key: "action",
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
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 80,
      render: (value: string) => (
        <img
          src={value || "https://via.placeholder.com/56"}
          alt="sp"
          style={{
            width: 56,
            height: 56,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (_: any, record: PosProductSearchResponse) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.productName}</div>
          <div>{record.variantCode}</div>
          <div>Barcode: {record.barcode || "-"}</div>
        </div>
      ),
    },
    {
      title: "Tồn",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 80,
    },
    {
      title: "Giá",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 140,
      render: (value: number) => `${currency(value)} đ`,
    },
    {
      title: "",
      key: "action",
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
    const total = selectedOrder?.totalAmount || 0;
    const discount = selectedDiscount?.estimatedDiscountAmount || 0;
    const final = Math.max(total - discount, 0);

    return {
      total,
      discount,
      final,
    };
  }, [selectedOrder, selectedDiscount]);

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={[16, 16]} align="top">
        <Col xs={24} xl={5}>
          <Card
            title="Hóa đơn nháp"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={creating}
                onClick={handleCreateOrder}
              >
                Tạo hóa đơn
              </Button>
            }
            style={panelCardStyle}
          >
            {draftOrders.length === 0 ? (
              <Empty description="Chưa có hóa đơn nháp" />
            ) : (
              <List
                dataSource={draftOrders}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => setSelectedOrderId(item.orderId)}
                    style={{
                      cursor: "pointer",
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      background:
                        selectedOrderId === item.orderId ? "#e6f4ff" : "#fafafa",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      <div style={{ fontWeight: 600 }}>{item.orderCode}</div>
                      <div>Khách: {item.customerName || "Khách lẻ"}</div>
                      <div>Tổng: {currency(item.finalAmount)} đ</div>
                      <Tag color="blue">{item.status}</Tag>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={10}>
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
            style={panelCardStyle}
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

        <Col xs={24} xl={9}>
          <Card
            style={panelCardStyle}
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
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <div>
                  <Text strong>Mã hóa đơn:</Text> {selectedOrder.orderCode}
                </div>

                <div>
                  <Text strong>Khách hàng:</Text>{" "}
                  {selectedOrder.customerName || "Khách lẻ"}
                </div>

                <Space.Compact style={{ width: "100%" }}>
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập customerId"
                    value={customerIdInput as number | null}
                    onChange={(value) =>
                      setCustomerIdInput(value as number | null)
                    }
                  />
                  <Button onClick={handleAssignCustomer}>Gán khách</Button>
                  <Button onClick={() => setCustomerIdInput(null)} danger>
                    Bỏ khách
                  </Button>
                </Space.Compact>

                <Table
                  rowKey="itemId"
                  columns={orderColumns}
                  dataSource={selectedOrder.items || []}
                  pagination={false}
                  scroll={{ y: 300 }}
                  locale={{ emptyText: "Chưa có sản phẩm" }}
                />

                <Card size="small" style={panelCardStyle}>
                  <Card
                    size="small"
                    title={
                      <Space>
                        <GiftOutlined />
                        <span>Voucher khả dụng</span>
                      </Space>
                    }
                    loading={loadingDiscounts}
                    style={{ marginBottom: 12 }}
                  >
                    {availableDiscounts.length === 0 ? (
                      <Text type="secondary">Chưa có voucher phù hợp</Text>
                    ) : (
                      <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size={8}
                      >
                        {availableDiscounts.map((discount) => {
                          const selected =
                            selectedDiscount?.voucherType ===
                              discount.voucherType &&
                            selectedDiscount?.id === discount.id;

                          return (
                            <Card
                              key={`${discount.voucherType}-${discount.id}`}
                              size="small"
                              hoverable
                              onClick={() => handleSelectDiscount(discount)}
                              style={{
                                ...voucherCardBaseStyle,
                                border: selected
                                  ? "1px solid #1677ff"
                                  : "1px solid #f0f0f0",
                                background: selected ? "#f0f7ff" : "#fff",
                                cursor: "pointer",
                              }}
                            >
                              <Space
                                direction="vertical"
                                size={6}
                                style={{ width: "100%" }}
                              >
                                <Row justify="space-between" align="middle">
                                  <Text strong>{discount.code}</Text>

                                  <Space wrap>
                                    {discount.bestVoucher && (
                                      <Tag color="green">Tốt nhất</Tag>
                                    )}

                                    {selected && (
                                      <Tag color="blue">Đã chọn</Tag>
                                    )}

                                    <Tag
                                      color={
                                        discount.voucherType === "COUPON"
                                          ? "gold"
                                          : "blue"
                                      }
                                    >
                                      {discount.voucherType === "COUPON"
                                        ? "Coupon"
                                        : "Khuyến mãi"}
                                    </Tag>
                                  </Space>
                                </Row>

                                <Text strong>{discount.name}</Text>

                                <Text type="secondary">
                                  Giảm dự kiến:{" "}
                                  <Text strong>
                                    {currency(
                                      discount.estimatedDiscountAmount,
                                    )}{" "}
                                    đ
                                  </Text>
                                </Text>

                                <Text type="secondary">
                                  Hình thức:{" "}
                                  {discount.discountType === "PERCENTAGE"
                                    ? `${discount.discountValue}%`
                                    : `${currency(discount.discountValue)} đ`}
                                </Text>

                                {discount.minOrderValue ? (
                                  <Text type="secondary">
                                    Đơn tối thiểu:{" "}
                                    {currency(discount.minOrderValue)} đ
                                  </Text>
                                ) : null}

                                <Text type="secondary">
                                  Phát hành:{" "}
                                  {formatUsageNumber(discount.issuedQuantity)} |{" "}
                                  Còn lại:{" "}
                                  {formatUsageNumber(discount.remainingCount)}
                                </Text>

                                <Text type="secondary">
                                  Đã dùng:{" "}
                                  {formatUsagePercent(discount.usedPercent)} |{" "}
                                  Còn:{" "}
                                  {formatUsagePercent(
                                    discount.remainingPercent,
                                  )}
                                </Text>

                                <Text type="secondary">
                                  {discount.endDate
                                    ? `Hết hạn: ${new Date(discount.endDate).toLocaleString("vi-VN")}`
                                    : "Không giới hạn thời gian"}
                                </Text>
                              </Space>
                            </Card>
                          );
                        })}

                        {selectedDiscount && (
                          <Button danger onClick={handleClearDiscount}>
                            Bỏ chọn voucher
                          </Button>
                        )}
                      </Space>
                    )}
                  </Card>

                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size={6}
                  >
                    <Row justify="space-between">
                      <Text>Tạm tính</Text>
                      <Text>{currency(summary.total)} đ</Text>
                    </Row>

                    <Row justify="space-between">
                      <Text>Giảm giá</Text>
                      <Text style={{ color: "#cf1322", fontWeight: 500 }}>
                        - {currency(summary.discount)} đ
                      </Text>
                    </Row>

                    {selectedDiscount?.code && (
                      <Row justify="space-between">
                        <Text>Mã voucher</Text>
                        <Text strong>{selectedDiscount.code}</Text>
                      </Row>
                    )}

                    <Row justify="space-between" align="middle">
                      <Title level={5} style={{ margin: 0 }}>
                        Cần thanh toán
                      </Title>
                      <Title level={5} style={{ margin: 0, color: "#cf1322" }}>
                        {currency(summary.final)} đ
                      </Title>
                    </Row>
                  </Space>
                </Card>

                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
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
                        customerPaid: summary.final,
                        note: selectedOrder?.note || "",
                      }));
                      setCheckoutOpen(true);
                    }}
                    disabled={!selectedOrder.items?.length}
                  >
                    Thanh toán
                  </Button>
                </Space>
              </Space>
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
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <div>
            <Text strong>Tạm tính:</Text> {currency(summary.total)} đ
          </div>

          <div>
            <Text strong>Giảm giá áp dụng:</Text> {currency(summary.discount)} đ
          </div>

          {selectedDiscount?.code && (
            <div>
              <Text strong>Voucher đã chọn:</Text> {selectedDiscount.code}
            </div>
          )}

          <div>
            <Text strong>Cần thanh toán:</Text> {currency(summary.final)} đ
          </div>

          <div>
            <Text strong>Phương thức thanh toán</Text>
            <Select
              style={{ width: "100%", marginTop: 6 }}
              options={paymentOptions}
              value={checkoutData.paymentMethodId}
              onChange={(value) =>
                setCheckoutData((prev) => ({
                  ...prev,
                  paymentMethodId: value,
                }))
              }
            />
          </div>

          <div>
            <Text strong>Tiền khách đưa</Text>
            <InputNumber
              style={{ width: "100%", marginTop: 6 }}
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
                setCheckoutData((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default PosManagement;