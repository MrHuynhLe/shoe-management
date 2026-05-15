import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  Typography,
  Button,
  Space,
  Tag,
  Divider,
  Spin,
  notification,
  InputNumber,
  message,
  Modal,
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  SafetyOutlined,
  SyncOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { productService } from "@/services/product.service";
import { cartService } from "@/services/cart.service";
import { useAuth } from "@/services/AuthContext";
import apiClient from "@/services/api";
import { ProductDetail, Variant } from "../admin/VariantDetailModal";
import { PageResponse, ProductList } from "./product.model";
import { resolveImageUrl } from "@/utils/utils";
import ProductListDisplay from "./Products";
import ProductReviewsSection from "@/features/review/ProductReviewsSection";

const { Title, Text, Paragraph } = Typography;

const NO_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23cccccc' d='M448 80h-80L288 0 160 80H80c-26.5 0-48 21.5-48 48v304c0 26.5 21.5 48 48 48h368c26.5 0 48-21.5 48-48V128c0-26.5-21.5-48-48-48zm-224 48c44.2 0 80 35.8 80 80s-35.8 80-80 80-80-35.8-80-80 35.8-80 80-80zm144 256H96v-16c0-44.2 89.5-64 128-64s89.5 19.8 128 64v16z'/%3E%3C/svg%3E";

const formatMoney = (value?: number | string) =>
  `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const getProductImage = (product: any) => {
  return (
    product?.imageUrl ||
    product?.image_url ||
    product?.primaryImage ||
    product?.primary_image ||
    product?.thumbnail ||
    product?.thumbUrl ||
    product?.thumb_url ||
    product?.images?.[0]?.imageUrl ||
    product?.images?.[0]?.image_url ||
    product?.images?.[0] ||
    ""
  );
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, fetchOrderCount } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    window.scrollTo(0, 0);
    setLoading(true);

    productService
      .getProductById(Number(id))
      .then((response) => {
        const productData = response.data;
        setProduct(productData);

        if (productData.images && productData.images.length > 0) {
          setSelectedImage(resolveImageUrl(productData.images[0]));
        } else {
          setSelectedImage(resolveImageUrl(getProductImage(productData)));
        }
      })
      .catch((error) => {
        console.error("Failed to fetch product details:", error);
        notification.error({
          message: "Lỗi",
          description:
            "Không thể tải thông tin sản phẩm. Có thể sản phẩm không tồn tại.",
        });
        navigate("/products", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const sellableVariants = useMemo(() => {
    if (!product?.variants) return [];

    return product.variants.filter(
      (v: any) =>
        (v.isActive ?? true) &&
        (v.productIsActive ?? true) &&
        v.deletedAt == null &&
        (v.stockQuantity ?? 0) >= 0,
    );
  }, [product]);

  const { allSizes, allColors, variantsBySize, variantsByColor } =
    useMemo(() => {
      if (!product) {
        return {
          allSizes: [],
          allColors: [],
          variantsBySize: {} as Record<string, Variant[]>,
          variantsByColor: {} as Record<string, Variant[]>,
        };
      }

      const allSizes = [
        ...new Set(
          sellableVariants.map((v) => v.attributes.SIZE).filter(Boolean),
        ),
      ];

      const allColors = [
        ...new Set(
          sellableVariants.map((v) => v.attributes.COLOR).filter(Boolean),
        ),
      ];

      const variantsByColor = allColors.reduce(
        (acc, color) => {
          acc[color] = sellableVariants.filter(
            (v) => v.attributes.COLOR === color,
          );
          return acc;
        },
        {} as Record<string, Variant[]>,
      );

      const variantsBySize = allSizes.reduce(
        (acc, size) => {
          acc[size] = sellableVariants.filter(
            (v) => v.attributes.SIZE === size,
          );
          return acc;
        },
        {} as Record<string, Variant[]>,
      );

      return { allSizes, allColors, variantsBySize, variantsByColor };
    }, [product, sellableVariants]);
    
  

  const selectedVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;

    return (
      sellableVariants.find(
        (v) =>
          v.attributes.SIZE === selectedSize &&
          v.attributes.COLOR === selectedColor,
      ) || null
    );
  }, [sellableVariants, selectedSize, selectedColor]);

  useEffect(() => {
    if (!product) return;

    if (selectedVariant?.images?.length) {
      setSelectedImage(resolveImageUrl(selectedVariant.images[0]));
      return;
    }

    if (selectedColor) {
      const variantsOfColor = product.variants.filter(
        (v) => v.attributes.COLOR === selectedColor,
      );
      const colorImages = variantsOfColor.flatMap((v) => v.images || []);
      if (colorImages.length > 0) {
        setSelectedImage(resolveImageUrl(colorImages[0]));
        return;
      }
    }

    if (product.images && product.images.length > 0) {
      setSelectedImage(resolveImageUrl(product.images[0]));
      return;
    }

    setSelectedImage(resolveImageUrl(getProductImage(product)));
  }, [product, selectedColor, selectedVariant]);

  const imageListToDisplay = useMemo(() => {
    if (!product) return [];

    let newImageList: string[] = [];

    if (selectedVariant?.images?.length) {
      newImageList = selectedVariant.images;
    } else if (selectedColor) {
      const variantsOfColor = product.variants.filter(
        (v) => v.attributes.COLOR === selectedColor,
      );
      newImageList = variantsOfColor.flatMap((v) => v.images || []);
    }

    if (newImageList.length === 0) {
      newImageList = product.images || [];
    }

    return [...new Set(newImageList)];
  }, [product, selectedColor, selectedVariant]);
  //
  const availableSizesForSelectedColor = selectedColor
    ? variantsByColor[selectedColor]
        ?.filter((v) => (v.stockQuantity ?? 0) > 0)
        .map((v) => v.attributes.SIZE) || []
    : allSizes;

  const availableColorsForSelectedSize = selectedSize
    ? variantsBySize[selectedSize]
        ?.filter((v) => (v.stockQuantity ?? 0) > 0)
        .map((v) => v.attributes.COLOR) || []
    : allColors;

  const isSizeDisabled = (size: string) => {
    if (selectedColor && !availableSizesForSelectedColor.includes(size)) {
      return true;
    }

    const variantsForThisSize = variantsBySize[size];
    if (
      !variantsForThisSize ||
      variantsForThisSize.every((v) => (v.stockQuantity ?? 0) <= 0)
    ) {
      return true;
    }

    return false;
  };

  const isColorDisabled = (color: string) => {
    if (selectedSize && !availableColorsForSelectedSize.includes(color)) {
      return true;
    }

    const variantsForThisColor = variantsByColor[color];
    if (
      !variantsForThisColor ||
      variantsForThisColor.every((v) => (v.stockQuantity ?? 0) <= 0)
    ) {
      return true;
    }

    return false;
  };
  //

  const handleSelectAttribute = (type: "size" | "color", value: string) => {
    if (type === "size") {
      setSelectedSize((prev) => (prev === value ? null : value));
    } else {
      setSelectedColor((prev) => (prev === value ? null : value));
    }
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      message.warning("Vui lòng chọn size và màu trước khi thêm vào giỏ hàng.");
      return;
    }

    if (!quantity || quantity <= 0) {
      message.warning("Số lượng không hợp lệ.");
      return;
    }

    if ((selectedVariant.stockQuantity ?? 0) <= 0) {
      message.error("Sản phẩm này đã hết hàng.");
      return;
    }

    if (quantity > (selectedVariant.stockQuantity ?? 0)) {
      message.warning("Số lượng vượt quá tồn kho hiện có.");
      return;
    }

    Modal.confirm({
      title: "Xác nhận thêm vào giỏ hàng?",
      content: `Bạn có muốn thêm ${quantity} sản phẩm vào giỏ hàng không?`,
      okText: "Thêm",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await cartService.addToCart({
            productVariantId: selectedVariant.id,
            quantity,
          });

          message.success("Đã thêm vào giỏ hàng.");
          fetchOrderCount();
        } catch (error: any) {
          message.error(
            error?.response?.data?.message ||
              "Thêm vào giỏ hàng thất bại. Vui lòng thử lại.",
          );
        }
      },
    });
  };
  const selectedStock = selectedVariant?.stockQuantity ?? 0;
  const isOutOfStock = !selectedVariant || selectedStock <= 0;
  const isLowStock =
    selectedVariant != null && selectedStock > 0 && selectedStock <= 5;

  if (!product) {
    return (
      <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
    );
  }

  return (
    <Spin spinning={loading} size="large" tip="Đang tải sản phẩm...">
      <div
        style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.3s ease" }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/products")}
          type="text"
          style={{ marginBottom: 12 }}
        >
          Quay lại
        </Button>

        <Row gutter={[28, 28]} className="product-detail-shell" style={{ padding: 24 }}>
          <Col xs={24} md={12}>
            <div
              style={{
                background: "#f7f7f8",
                border: "1px solid #eef2f7",
                borderRadius: 8,
                padding: 12,
                aspectRatio: "1 / 1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                width="100%"
                height="100%"
                src={selectedImage || NO_IMAGE_PLACEHOLDER}
                preview={false}
                fallback={NO_IMAGE_PLACEHOLDER}
                style={{ objectFit: "contain" }}
              />
            </div>

            <Row
              gutter={[10, 10]}
              style={{ marginTop: 16, maxHeight: "220px", overflowY: "auto" }}
            >
              {imageListToDisplay.map((img, index) => {
                const resolvedImg = resolveImageUrl(img);

                return (
                  <Col span={4} key={index}>
                    <div
                      style={{
                        aspectRatio: "1 / 1",
                        border:
                          selectedImage === resolvedImg
                            ? "2px solid #1677ff"
                            : "2px solid #f0f0f0",
                        background: "#f7f7f8",
                        borderRadius: 6,
                        padding: "4px",
                        cursor: "pointer",
                        transition:
                          "transform 0.2s ease, border-color 0.2s ease",
                      }}
                      onClick={() => setSelectedImage(resolvedImg)}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        if (selectedImage !== resolvedImg) {
                          e.currentTarget.style.borderColor = "#91caff";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        if (selectedImage !== resolvedImg) {
                          e.currentTarget.style.borderColor = "#f0f0f0";
                        }
                      }}
                    >
                      <Image
                        src={resolvedImg}
                        preview={false}
                        fallback={NO_IMAGE_PLACEHOLDER}
                        width="100%"
                        height="100%"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Col>

          <Col xs={24} md={12}>
            <Title level={2} style={{ fontWeight: 800, fontSize: 28, marginTop: 0 }}>
              {product.name}
            </Title>

            <Title
              level={3}
              style={{ color: "#e11d2e", marginTop: 12, marginBottom: 0, fontWeight: 800 }}
            >
              {selectedVariant ? (
                <Space direction="vertical" size={2}>
                  <span>
                    {formatMoney(
                      selectedVariant.salePrice ??
                        selectedVariant.unitPrice ??
                        selectedVariant.sellingPrice,
                    )}
                  </span>
                  {selectedVariant.isSale &&
                    Number(selectedVariant.discountPercent || 0) > 0 &&
                    Number(selectedVariant.originalPrice ?? selectedVariant.sellingPrice) >
                      Number(selectedVariant.salePrice ?? selectedVariant.unitPrice ?? selectedVariant.sellingPrice) && (
                      <Space size={8}>
                        <Text delete type="secondary" style={{ fontSize: 16 }}>
                          {formatMoney(selectedVariant.originalPrice ?? selectedVariant.sellingPrice)}
                        </Text>
                        <Tag color="red">
                          -{Number(selectedVariant.discountPercent).toFixed(0)}%
                        </Tag>
                      </Space>
                    )}
                </Space>
              ) : (
                "Chọn Size và Màu để xem giá"
              )}
            </Title>

            <Space>
              <Tag color="blue">{product.brandName}</Tag>
              <Tag color="purple">{product.categoryName}</Tag>
            </Space>

            {selectedVariant && (
              <>
                <div style={{ marginTop: 8 }}>
                  <Text>Tồn kho: {selectedStock}</Text>
                </div>

                {isOutOfStock && (
                  <div style={{ color: "red", marginTop: 8 }}>
                    Sản phẩm hiện đã hết hàng.
                  </div>
                )}

                {!isOutOfStock && isLowStock && (
                  <div style={{ color: "#fa8c16", marginTop: 8 }}>
                    Sản phẩm sắp hết hàng, vui lòng đặt sớm.
                  </div>
                )}

                {!isOutOfStock && !isLowStock && (
                  <div style={{ color: "#52c41a", marginTop: 8 }}>
                    Sản phẩm còn hàng.
                  </div>
                )}
              </>
            )}

            <Divider />
            <Divider />

            <div>
              <Text strong>Size:</Text>
              <Space wrap style={{ marginTop: 8, marginBottom: 16 }}>
                {allSizes.map((size) => (
                  <Button
                    key={size}
                    type={selectedSize === size ? "primary" : "default"}
                    onClick={() => handleSelectAttribute("size", size)}
                    disabled={isSizeDisabled(size)}
                  >
                    {size}
                  </Button>
                ))}
              </Space>
            </div>

            <div>
              <Text strong>Màu sắc:</Text>
              <Space wrap style={{ marginTop: 8, marginBottom: 16 }}>
                {allColors.map((color) => (
                  <Button
                    key={color}
                    type={selectedColor === color ? "primary" : "default"}
                    onClick={() => handleSelectAttribute("color", color)}
                    disabled={isColorDisabled(color)}
                  >
                    {color}
                  </Button>
                ))}
              </Space>
            </div>

            <div style={{ marginTop: 8 }}>
              <Text strong>Thêm vào yêu thích:</Text>
              <Space style={{ marginLeft: 12 }}>
                <FavoriteButton productId={product.id} />
              </Space>
            </div>

            <Divider />

            <div>
              <Text strong>Mô tả sản phẩm:</Text>
              <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                {product.description?.split("\n").map((item, index) =>
                  item.trim() ? (
                    <li key={index}>
                      <Paragraph style={{ marginBottom: "4px" }}>
                        {item.trim()}
                      </Paragraph>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>

            <Divider />

            <Space
              direction="vertical"
              size="middle"
              style={{ marginBottom: "24px" }}
            >
              <Space align="center" size="large">
                <InputNumber
                  min={1}
                  max={Math.max(selectedStock, 1)}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  disabled={isOutOfStock}
                />

                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  size="large"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  style={{ minWidth: 320 }}
                >
                  {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </Button>
              </Space>
            </Space>

            <Divider />

            <Row gutter={[12, 12]}>
              {[
                [<TruckOutlined />, "Miễn phí vận chuyển", "Đơn hàng từ 500.000đ"],
                [<SyncOutlined />, "Đổi trả dễ dàng", "Trong 7 ngày"],
                [<SafetyOutlined />, "Thanh toán an toàn", "Hỗ trợ nhiều hình thức"],
              ].map(([icon, title, desc]) => (
                <Col xs={24} sm={8} key={String(title)}>
                  <Space align="center">
                    <span style={{ color: "#0f73ff", fontSize: 24 }}>{icon}</span>
                    <span>
                      <Text strong style={{ display: "block", fontSize: 13 }}>
                        {title}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {desc}
                      </Text>
                    </span>
                  </Space>
                </Col>
              ))}
            </Row>

          </Col>
        </Row>

        <Divider />

        <ProductReviewsSection productId={product.id} />

        <Divider />

        <SuggestedProducts currentProductId={product.id} />
      </div>
    </Spin>
  );
};

const SuggestedProducts = ({
  currentProductId,
}: {
  currentProductId: number;
}) => {
  const [products, setProducts] = useState<PageResponse<ProductList>>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    productService
      .filterProducts({ page: 0, size: 4 })
      .then((res) => {
        const filteredProducts = {
          ...res.data,
          content: res.data.content.filter(
            (p: ProductList) => p.id !== currentProductId,
          ),
        };
        setProducts(filteredProducts);
      })
      .finally(() => setLoading(false));
  }, [currentProductId]);

  if (loading) {
    return <Spin />;
  }

  return (
    <div>
      <Title level={3} style={{ fontWeight: "600" }}>
        Có thể bạn cũng thích
      </Title>

      {products?.content?.length ? (
        <ProductListDisplay products={products.content} hideTitle />
      ) : null}
    </div>
  );
};

export default ProductDetailPage;

const FavoriteButton = ({ productId }: { productId: number }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchFavorite = async () => {
      if (!isAuthenticated) {
        setIsFavorite(false);
        return;
      }

      setLoading(true);
      try {
        const res = await apiClient.get(`/v1/favorites/${productId}/check`);
        if (!mounted) return;
        // Kiểm tra nếu response.data = true thì set isFavorite = true
        setIsFavorite(res.data === true);
      } catch (err: any) {
        if (!mounted) return;
        // Nếu 404 hoặc lỗi khác, coi như chưa thích
        setIsFavorite(false);
        if (err?.response?.status !== 404) {
          console.error('fetch favorite error', err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFavorite();

    return () => {
      mounted = false;
    };
  }, [productId, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      message.error("Bạn chưa đăng nhập. Vui lòng đăng nhập để thêm yêu thích.");
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Nếu đã tích, gọi DELETE để xóa khỏi danh sách yêu thích
        await apiClient.delete(`/v1/favorites/${productId}`);
        setIsFavorite(false);
        message.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        // Nếu chưa tích, gọi POST để thêm vào danh sách yêu thích
        await apiClient.post(`/v1/favorites/${productId}`);
        setIsFavorite(true);
        message.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error: any) {
      console.error('favorite error', error);
      message.error(
        error?.response?.data?.message || 'Thao tác yêu thích thất bại. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="text"
      icon={
        isFavorite ? (
          <HeartFilled style={{ color: "#ff4d4f" }} />
        ) : (
          <HeartOutlined />
        )
      }
      onClick={handleToggleFavorite}
      loading={loading}
    />
  );
};
