import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Image,
  Input,
  InputNumber,
  List,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Tabs,
  Tag,
  Typography,
  Avatar,
  message,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  CreditCardOutlined,
  WalletOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;

type VariantAttribute = {
  COLOR?: string;
  SIZE?: string;
  MATERIAL?: string;
};

type ProductVariant = {
  id: number;
  code: string;
  barcode: string;
  sellingPrice: number;
  stockQuantity: number;
  binLocation: string;
  attributes: VariantAttribute;
  image: string;
};

type ProductItem = {
  id: number;
  code: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  variants: ProductVariant[];
};

type CustomerItem = {
  id: number;
  code: string;
  fullName: string;
  phone: string;
  loyaltyPoints: number;
  customerType: string;
};

type CartItem = {
  cartKey: string;
  productId: number;
  productName: string;
  productCode: string;
  variantId: number;
  variantCode: string;
  barcode: string;
  image: string;
  attributes: VariantAttribute;
  price: number;
  stockQuantity: number;
  quantity: number;
};

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + " đ";

const productsMock: ProductItem[] = [
  {
    id: 1,
    code: "AF1-01",
    name: "Nike Air Force 1 07",
    brand: "Nike",
    category: "Giày Sneaker",
    description: "Mẫu giày huyền thoại mọi thời đại",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    variants: [
      {
        id: 101,
        code: "AF1-W-42",
        barcode: "8930001",
        sellingPrice: 2200000,
        stockQuantity: 49,
        binLocation: "Kệ A1",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
        attributes: { COLOR: "Trắng", SIZE: "42", MATERIAL: "Da thật" },
      },
      {
        id: 102,
        code: "AF1-B-40",
        barcode: "8930002",
        sellingPrice: 2200000,
        stockQuantity: 30,
        binLocation: "Kệ A2",
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200&auto=format&fit=crop",
        attributes: { COLOR: "Đen", SIZE: "40", MATERIAL: "Da thật" },
      },
    ],
  },
  {
    id: 2,
    code: "ULTRA-01",
    name: "Adidas Ultraboost Light",
    brand: "Adidas",
    category: "Giày Chạy Bộ",
    description: "Êm ái, linh hoạt, phù hợp chạy bộ hằng ngày",
    image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1200&auto=format&fit=crop",
    variants: [
      {
        id: 201,
        code: "ULTRA-W-41",
        barcode: "8930010",
        sellingPrice: 3100000,
        stockQuantity: 12,
        binLocation: "Kệ B1",
        image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1200&auto=format&fit=crop",
        attributes: { COLOR: "Trắng", SIZE: "41", MATERIAL: "Knit" },
      },
      {
        id: 202,
        code: "ULTRA-B-42",
        barcode: "8930011",
        sellingPrice: 3150000,
        stockQuantity: 5,
        binLocation: "Kệ B2",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop",
        attributes: { COLOR: "Đen", SIZE: "42", MATERIAL: "Knit" },
      },
    ],
  },
  {
    id: 3,
    code: "JD-LOW-01",
    name: "Jordan Low Retro",
    brand: "Jordan",
    category: "Giày Bóng Rổ",
    description: "Thiết kế nổi bật, form đẹp, phù hợp đi chơi",
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1200&auto=format&fit=crop",
    variants: [
      {
        id: 301,
        code: "JD-R-42",
        barcode: "8930020",
        sellingPrice: 4200000,
        stockQuantity: 0,
        binLocation: "Kệ C1",
        image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1200&auto=format&fit=crop",
        attributes: { COLOR: "Đỏ", SIZE: "42", MATERIAL: "Da tổng hợp" },
      },
    ],
  },
];

const customersMock: CustomerItem[] = [
  {
    id: 1,
    code: "KH0001",
    fullName: "Lê Khách Hàng",
    phone: "0909998887",
    loyaltyPoints: 100,
    customerType: "RETAIL",
  },
  {
    id: 2,
    code: "KH0002",
    fullName: "Nguyễn Văn D",
    phone: "0912345678",
    loyaltyPoints: 250,
    customerType: "VIP",
  },
];

const paymentMethods = [
  { code: "CASH", name: "Tiền mặt" },
  { code: "BANK", name: "Chuyển khoản" },
  { code: "MOMO", name: "Ví MoMo" },
];

const holdOrders = [
  { key: "HD001", label: "HD001" },
  { key: "HD002", label: "HD002" },
  { key: "HD003", label: "HD003" },
];

const getStockTag = (stock: number) => {
  if (stock <= 0) return <Tag color="red">Hết hàng</Tag>;
  if (stock <= 10) return <Tag color="orange">Sắp hết</Tag>;
  return <Tag color="green">Còn hàng</Tag>;
};

const attrsText = (attrs: VariantAttribute) =>
  [attrs.COLOR, attrs.SIZE, attrs.MATERIAL].filter(Boolean).join(" / ");

const PosManagementPage = () => {
  const [keyword, setKeyword] = useState("");
  const [brandFilter, setBrandFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [customerKeyword, setCustomerKeyword] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedHoldOrder, setSelectedHoldOrder] = useState("HD001");
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [variantQuantity, setVariantQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [receivedAmount, setReceivedAmount] = useState<number>(0);

  const brands = [...new Set(productsMock.map((p) => p.brand))];
  const categories = [...new Set(productsMock.map((p) => p.category))];

  const filteredProducts = useMemo(() => {
    return productsMock.filter((product) => {
      const kw = keyword.trim().toLowerCase();
      const matchKeyword =
        !kw ||
        product.name.toLowerCase().includes(kw) ||
        product.code.toLowerCase().includes(kw) ||
        product.variants.some(
          (v) =>
            v.code.toLowerCase().includes(kw) ||
            v.barcode.toLowerCase().includes(kw)
        );

      const matchBrand = !brandFilter || product.brand === brandFilter;
      const matchCategory = !categoryFilter || product.category === categoryFilter;

      return matchKeyword && matchBrand && matchCategory;
    });
  }, [keyword, brandFilter, categoryFilter]);

  const filteredCustomers = useMemo(() => {
    const kw = customerKeyword.trim().toLowerCase();
    return customersMock.filter(
      (c) =>
        !kw ||
        c.fullName.toLowerCase().includes(kw) ||
        c.phone.includes(kw) ||
        c.code.toLowerCase().includes(kw)
    );
  }, [customerKeyword]);

  const selectedVariant =
    selectedProduct?.variants.find((v) => v.id === selectedVariantId) || null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const autoDiscount = subtotal >= 5000000 ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = Math.max(subtotal - autoDiscount, 0);
  const changeAmount = Math.max((receivedAmount || 0) - finalTotal, 0);

  const openVariantModal = (product: ProductItem) => {
    setSelectedProduct(product);
    setSelectedVariantId(product.variants[0]?.id ?? null);
    setVariantQuantity(1);
    setVariantModalOpen(true);
  };

  const addSelectedVariantToCart = () => {
    if (!selectedProduct || !selectedVariant) return;

    if (selectedVariant.stockQuantity <= 0) {
      message.error("Biến thể này đã hết hàng");
      return;
    }

    if (variantQuantity > selectedVariant.stockQuantity) {
      message.error("Số lượng vượt quá tồn kho");
      return;
    }

    const cartKey = `${selectedProduct.id}-${selectedVariant.id}`;
    const existed = cartItems.find((item) => item.cartKey === cartKey);

    if (existed) {
      const newQty = existed.quantity + variantQuantity;
      if (newQty > selectedVariant.stockQuantity) {
        message.error("Tổng số lượng trong giỏ vượt quá tồn kho");
        return;
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: newQty } : item
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          cartKey,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          productCode: selectedProduct.code,
          variantId: selectedVariant.id,
          variantCode: selectedVariant.code,
          barcode: selectedVariant.barcode,
          image: selectedVariant.image,
          attributes: selectedVariant.attributes,
          price: selectedVariant.sellingPrice,
          stockQuantity: selectedVariant.stockQuantity,
          quantity: variantQuantity,
        },
      ]);
    }

    message.success("Đã thêm sản phẩm vào giỏ");
    setVariantModalOpen(false);
  };

  const updateCartQuantity = (cartKey: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartKey !== cartKey) return item;
        const nextQty = Math.max(1, Math.min(quantity, item.stockQuantity));
        return { ...item, quantity: nextQty };
      })
    );
  };

  const removeCartItem = (cartKey: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const resetOrder = () => {
    setCartItems([]);
    setSelectedCustomer(null);
    setCustomerKeyword("");
    setPaymentMethod("CASH");
    setReceivedAmount(0);
    message.success("Đã làm mới hóa đơn");
  };

  return (
    <>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card bodyStyle={{ padding: 16 }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                Bán tại quầy
              </Title>
              <Text type="secondary">
                Tạo hóa đơn và thanh toán trực tiếp tại cửa hàng
              </Text>
            </Col>
            <Col>
              <Space size="large">
                <div>
                  <Text type="secondary">Nhân viên</Text>
                  <br />
                  <Text strong>Trần Nhân Viên</Text>
                </div>
                <div>
                  <Text type="secondary">Chi nhánh</Text>
                  <br />
                  <Text strong>Chi nhánh Quận 1</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        <Tabs
          activeKey={selectedHoldOrder}
          onChange={setSelectedHoldOrder}
          type="card"
          items={[
            ...holdOrders.map((item) => ({
              key: item.key,
              label: item.label,
              children: null,
            })),
            {
              key: "new",
              label: (
                <span>
                  <PlusOutlined /> Tạo hóa đơn
                </span>
              ),
              children: null,
            },
          ]}
          onTabClick={(key) => {
            if (key === "new") {
              message.info("UI hóa đơn chờ đang fix cứng, sẽ xử lý logic sau");
            }
          }}
        />

        <Row gutter={16} align="top">
          <Col xs={24} xl={15}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Card>
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={12}>
                    <Search
                      allowClear
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Tìm theo tên sản phẩm, mã biến thể, barcode..."
                      enterButton={<SearchOutlined />}
                      size="large"
                    />
                  </Col>
                  <Col xs={12} md={5}>
                    <Select
                      allowClear
                      style={{ width: "100%" }}
                      size="large"
                      placeholder="Thương hiệu"
                      value={brandFilter}
                      onChange={setBrandFilter}
                      options={brands.map((brand) => ({
                        label: brand,
                        value: brand,
                      }))}
                    />
                  </Col>
                  <Col xs={12} md={5}>
                    <Select
                      allowClear
                      style={{ width: "100%" }}
                      size="large"
                      placeholder="Danh mục"
                      value={categoryFilter}
                      onChange={setCategoryFilter}
                      options={categories.map((category) => ({
                        label: category,
                        value: category,
                      }))}
                    />
                  </Col>
                  <Col xs={24} md={2}>
                    <Button block size="large" icon={<BarcodeOutlined />}>
                      Quét
                    </Button>
                  </Col>
                </Row>
              </Card>

              <Card
                title="Danh sách sản phẩm"
                extra={<Text type="secondary">{filteredProducts.length} sản phẩm</Text>}
              >
                {filteredProducts.length === 0 ? (
                  <Empty description="Không tìm thấy sản phẩm phù hợp" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {filteredProducts.map((product) => {
                      const totalStock = product.variants.reduce(
                        (sum, v) => sum + v.stockQuantity,
                        0
                      );
                      const minPrice = Math.min(
                        ...product.variants.map((v) => v.sellingPrice)
                      );

                      return (
                        <Col xs={24} sm={12} lg={8} key={product.id}>
                          <Card
                            hoverable
                            bodyStyle={{ padding: 12 }}
                            cover={
                              <div style={{ height: 220, overflow: "hidden" }}>
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  preview={false}
                                  style={{
                                    width: "100%",
                                    height: 220,
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            }
                            actions={[
                              <Button
                                type="primary"
                                onClick={() => openVariantModal(product)}
                              >
                                Chọn
                              </Button>,
                            ]}
                          >
                            <Space
                              direction="vertical"
                              size={6}
                              style={{ width: "100%" }}
                            >
                              <Text strong>{product.name}</Text>
                              <Text type="secondary">{product.code}</Text>
                              <Space wrap>
                                <Tag>{product.brand}</Tag>
                                <Tag color="blue">{product.category}</Tag>
                              </Space>
                              <Text strong style={{ color: "#cf1322" }}>
                                {currency(minPrice)}
                              </Text>
                              <div>{getStockTag(totalStock)}</div>
                            </Space>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </Card>
            </Space>
          </Col>

          <Col xs={24} xl={9}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Card title="Khách hàng">
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Search
                    allowClear
                    value={customerKeyword}
                    onChange={(e) => setCustomerKeyword(e.target.value)}
                    placeholder="Tìm tên, SĐT, mã khách..."
                  />
                  <Space wrap>
                    <Button onClick={() => setSelectedCustomer(null)}>Khách lẻ</Button>
                    <Button type="dashed" icon={<PlusOutlined />}>
                      Tạo nhanh khách
                    </Button>
                  </Space>

                  {selectedCustomer ? (
                    <Card size="small" style={{ background: "#fafafa" }}>
                      <Space align="start">
                        <Avatar icon={<UserOutlined />} />
                        <div>
                          <Text strong>{selectedCustomer.fullName}</Text>
                          <br />
                          <Text type="secondary">
                            {selectedCustomer.code} • {selectedCustomer.phone}
                          </Text>
                          <br />
                          <Tag color="gold">
                            {selectedCustomer.loyaltyPoints} điểm
                          </Tag>
                          <Tag color="purple">{selectedCustomer.customerType}</Tag>
                        </div>
                      </Space>
                    </Card>
                  ) : (
                    <Tag>Khách lẻ</Tag>
                  )}

                  {!selectedCustomer && customerKeyword && filteredCustomers.length > 0 && (
                    <List
                      size="small"
                      bordered
                      dataSource={filteredCustomers}
                      renderItem={(customer) => (
                        <List.Item
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerKeyword(customer.fullName);
                          }}
                        >
                          <Space direction="vertical" size={0}>
                            <Text strong>{customer.fullName}</Text>
                            <Text type="secondary">
                              {customer.phone} • {customer.code}
                            </Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  )}
                </Space>
              </Card>

              <Card
                title={
                  <Space>
                    <ShoppingCartOutlined />
                    <span>Giỏ hàng</span>
                  </Space>
                }
                extra={<Text>{cartItems.length} sản phẩm</Text>}
              >
                {cartItems.length === 0 ? (
                  <Empty description="Chưa có sản phẩm trong hóa đơn" />
                ) : (
                  <List
                    dataSource={cartItems}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => removeCartItem(item.cartKey)}
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              shape="square"
                              size={56}
                              src={item.image}
                              style={{ borderRadius: 8 }}
                            />
                          }
                          title={
                            <Space direction="vertical" size={0}>
                              <Text strong>{item.productName}</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {item.variantCode} • {attrsText(item.attributes)}
                              </Text>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={8}>
                              <Text>{currency(item.price)}</Text>
                              <Space>
                                <Button
                                  size="small"
                                  onClick={() =>
                                    updateCartQuantity(item.cartKey, item.quantity - 1)
                                  }
                                >
                                  -
                                </Button>
                                <InputNumber
                                  min={1}
                                  max={item.stockQuantity}
                                  value={item.quantity}
                                  onChange={(value) =>
                                    updateCartQuantity(
                                      item.cartKey,
                                      Number(value || 1)
                                    )
                                  }
                                />
                                <Button
                                  size="small"
                                  onClick={() =>
                                    updateCartQuantity(item.cartKey, item.quantity + 1)
                                  }
                                >
                                  +
                                </Button>
                              </Space>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Tồn kho: {item.stockQuantity}
                              </Text>
                              <Text strong>
                                Thành tiền: {currency(item.price * item.quantity)}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>

              <Card title="Khuyến mãi & giảm giá">
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Card size="small" style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}>
                    <Text strong>Khuyến mãi tự động</Text>
                    <br />
                    {autoDiscount > 0 ? (
                      <>
                        <Text>Đơn hàng đạt ưu đãi giảm 10%</Text>
                        <br />
                        <Text strong style={{ color: "#389e0d" }}>
                          Giảm: {currency(autoDiscount)}
                        </Text>
                      </>
                    ) : (
                      <Text type="secondary">
                        Mua từ 5.000.000 đ để được giảm 10%
                      </Text>
                    )}
                  </Card>

                  <Space.Compact style={{ width: "100%" }}>
                    <Input placeholder="Nhập mã coupon" />
                    <Button>Áp dụng</Button>
                  </Space.Compact>
                </Space>
              </Card>

              <Card title="Thanh toán">
                <Space direction="vertical" size={14} style={{ width: "100%" }}>
                  <Radio.Group
                    block
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                  >
                    {paymentMethods.map((pm) => (
                      <Radio.Button key={pm.code} value={pm.code}>
                        {pm.name}
                      </Radio.Button>
                    ))}
                  </Radio.Group>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Statistic title="Tạm tính" value={subtotal} formatter={(v) => currency(Number(v))} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Giảm giá" value={autoDiscount} formatter={(v) => currency(Number(v))} />
                    </Col>
                  </Row>

                  <Card size="small" style={{ background: "#fff7e6", borderColor: "#ffd591" }}>
                    <Statistic
                      title="Tổng thanh toán"
                      value={finalTotal}
                      formatter={(v) => (
                        <span style={{ color: "#d4380d", fontWeight: 700 }}>
                          {currency(Number(v))}
                        </span>
                      )}
                    />
                  </Card>

                  {paymentMethod === "CASH" && (
                    <>
                      <InputNumber
                        style={{ width: "100%" }}
                        size="large"
                        min={0}
                        value={receivedAmount}
                        onChange={(value) => setReceivedAmount(Number(value || 0))}
                        formatter={(value) =>
                          `${String(value || "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
                        }
                        parser={(value) =>
                          Number(String(value || "").replace(/\./g, ""))
                        }
                        placeholder="Tiền khách đưa"
                      />
                      <Statistic
                        title="Tiền thừa trả khách"
                        value={changeAmount}
                        formatter={(v) => currency(Number(v))}
                      />
                    </>
                  )}

                  {(paymentMethod === "BANK" || paymentMethod === "MOMO") && (
                    <Card size="small">
                      <Text type="secondary">
                        Giao diện đang fix cứng. Sau này có thể thêm QR, mã giao dịch,
                        trạng thái thanh toán.
                      </Text>
                    </Card>
                  )}

                  <Divider style={{ margin: "8px 0" }} />

                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Button block onClick={resetOrder}>
                      Làm mới hóa đơn
                    </Button>
                    <Button block icon={<WalletOutlined />}>
                      Lưu tạm
                    </Button>
                    <Button block type="primary" size="large" icon={<CreditCardOutlined />}>
                      Thanh toán
                    </Button>
                    <Button block size="large" icon={<PrinterOutlined />}>
                      Thanh toán & In hóa đơn
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </Space>

      <Modal
        title="Chọn biến thể sản phẩm"
        open={variantModalOpen}
        onCancel={() => setVariantModalOpen(false)}
        onOk={addSelectedVariantToCart}
        okText="Thêm vào giỏ"
        width={920}
      >
        {selectedProduct && (
          <Row gutter={20}>
            <Col span={10}>
              <Image
                src={selectedVariant?.image || selectedProduct.image}
                alt={selectedProduct.name}
                preview={false}
                style={{
                  width: "100%",
                  height: 320,
                  objectFit: "cover",
                  borderRadius: 12,
                }}
              />
              <div style={{ marginTop: 12 }}>
                <Title level={5} style={{ marginBottom: 4 }}>
                  {selectedProduct.name}
                </Title>
                <Text type="secondary">{selectedProduct.code}</Text>
                <br />
                <Space wrap style={{ marginTop: 8 }}>
                  <Tag>{selectedProduct.brand}</Tag>
                  <Tag color="blue">{selectedProduct.category}</Tag>
                </Space>
                <p style={{ marginTop: 12, marginBottom: 0 }}>
                  {selectedProduct.description}
                </p>
              </div>
            </Col>

            <Col span={14}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div>
                  <Text strong>Chọn biến thể</Text>
                  <div style={{ marginTop: 12 }}>
                    <Radio.Group
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {selectedProduct.variants.map((variant) => (
                          <Card
                            key={variant.id}
                            size="small"
                            style={{
                              width: "100%",
                              border:
                                selectedVariantId === variant.id
                                  ? "1px solid #1677ff"
                                  : undefined,
                              opacity: variant.stockQuantity <= 0 ? 0.65 : 1,
                            }}
                          >
                            <Radio value={variant.id} disabled={variant.stockQuantity <= 0}>
                              <Space direction="vertical" size={4}>
                                <Text strong>{variant.code}</Text>
                                <Text type="secondary">
                                  {attrsText(variant.attributes)}
                                </Text>
                                <Space wrap>
                                  <Tag>Barcode: {variant.barcode}</Tag>
                                  <Tag>Kệ: {variant.binLocation}</Tag>
                                  {getStockTag(variant.stockQuantity)}
                                </Space>
                                <Text strong style={{ color: "#cf1322" }}>
                                  {currency(variant.sellingPrice)}
                                </Text>
                              </Space>
                            </Radio>
                          </Card>
                        ))}
                      </Space>
                    </Radio.Group>
                  </div>
                </div>

                {selectedVariant && (
                  <Card size="small" style={{ background: "#fafafa" }}>
                    <Row gutter={[12, 12]}>
                      <Col span={12}>
                        <Text type="secondary">Mã variant</Text>
                        <br />
                        <Text strong>{selectedVariant.code}</Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">Barcode</Text>
                        <br />
                        <Text strong>{selectedVariant.barcode}</Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">Vị trí kệ</Text>
                        <br />
                        <Text strong>{selectedVariant.binLocation}</Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">Tồn kho</Text>
                        <br />
                        <Text strong>{selectedVariant.stockQuantity}</Text>
                      </Col>
                    </Row>
                  </Card>
                )}

                <div>
                  <Text strong>Số lượng</Text>
                  <InputNumber
                    style={{ width: "100%", marginTop: 8 }}
                    min={1}
                    max={selectedVariant?.stockQuantity || 1}
                    value={variantQuantity}
                    onChange={(value) => setVariantQuantity(Number(value || 1))}
                  />
                </div>
              </Space>
            </Col>
          </Row>
        )}
      </Modal>
    </>
  );
};

export default PosManagementPage;