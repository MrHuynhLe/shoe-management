import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Typography, Button, Space, Tag, Divider, Spin, notification, InputNumber, Card, Tooltip, Form, Input, Rate, List, Avatar, Collapse } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { productService } from '@/services/product.service';
import { ProductDetail, Variant } from '../admin/VariantDetailModal';
import { Link } from 'react-router-dom';
import { PageResponse, ProductList } from './product.model';
const { Title, Text, Paragraph } = Typography;
const NO_IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23cccccc' d='M448 80h-80L288 0 160 80H80c-26.5 0-48 21.5-48 48v304c0 26.5 21.5 48 48 48h368c26.5 0 48-21.5 48-48V128c0-26.5-21.5-48-48-48zm-224 48c44.2 0 80 35.8 80 80s-35.8 80-80 80-80-35.8-80-80 35.8-80 80-80zm144 256H96v-16c0-44.2 89.5-64 128-64s89.5 19.8 128 64v16z'/%3E%3C/svg%3E";
const IMAGE_BASE_URL = 'http://localhost:8080/api';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      window.scrollTo(0, 0);

      setLoading(true);
      productService.getProductById(Number(id))
        .then(response => {
          const productData = response.data;
          setProduct(productData);
        })
        .catch(error => {
          console.error("Failed to fetch product details:", error);
          notification.error({
            message: 'Lỗi',
            description: 'Không thể tải thông tin sản phẩm. Có thể sản phẩm không tồn tại.',
          });
          navigate('/products', { replace: true });
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const { allSizes, allColors, variantsBySize, variantsByColor } = useMemo(() => {
    if (!product) return { allSizes: [], allColors: [], variantsBySize: {}, variantsByColor: {} };

    const allSizes = [...new Set(product.variants.map(v => v.attributes.SIZE))];
    const allColors = [...new Set(product.variants.map(v => v.attributes.COLOR))];

    const variantsByColor = allColors.reduce((acc, color) => {
      acc[color] = product.variants.filter(v => v.attributes.COLOR === color);
      return acc;
    }, {} as Record<string, Variant[]>);

    const variantsBySize = allSizes.reduce((acc, size) => {
      acc[size] = product.variants.filter(v => v.attributes.SIZE === size);
      return acc;
    }, {} as Record<string, Variant[]>);

    return { allSizes, allColors, variantsBySize, variantsByColor };
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product || !selectedSize || !selectedColor) return null;
    return product.variants.find(v => v.attributes.SIZE === selectedSize && v.attributes.COLOR === selectedColor) || null;
  }, [product, selectedSize, selectedColor]);

  useEffect(() => {
    if (!product) return;

    let newImageList: string[] = [];

    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      newImageList = selectedVariant.images;
    }

    else if (selectedColor) {
      const variantsOfColor = product.variants.filter(v => v.attributes.COLOR === selectedColor);
      newImageList = variantsOfColor.flatMap(v => v.images || []);
    }

    if (newImageList.length === 0) {
      newImageList = product.images || [];
    }
    setSelectedImage(newImageList.length > 0 ? `${IMAGE_BASE_URL}${newImageList[0]}` : '');
  }, [product, selectedColor, selectedVariant]);

  const availableSizesForSelectedColor = selectedColor ? variantsByColor[selectedColor]?.filter(v => v.stockQuantity > 0).map(v => v.attributes.SIZE) : allSizes;
  const availableColorsForSelectedSize = selectedSize ? variantsBySize[selectedSize]?.filter(v => v.stockQuantity > 0).map(v => v.attributes.COLOR) : allColors;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      notification.warning({
        message: 'Chưa chọn phiên bản',
        description: 'Vui lòng chọn đầy đủ Size và Màu sắc.',
      });
      return;
    }
    if (selectedVariant.stockQuantity < quantity) {
      notification.error({
        message: 'Không đủ hàng',
        description: `Chỉ còn ${selectedVariant.stockQuantity} sản phẩm trong kho.`,
      });
      return;
    }
    console.log('Adding to cart:', {
      variantId: selectedVariant.id,
      quantity: quantity,
      productName: product?.name,
      variantInfo: selectedVariant,
    });
    notification.success({
      message: 'Thêm vào giỏ hàng thành công!',
      description: `${product?.name} - Size: ${selectedSize} - Màu: ${selectedColor} (x${quantity})`,
    });
  };

  const imageListToDisplay = useMemo(() => {
    if (!product) return [];
    let newImageList: string[] = [];

    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      newImageList = selectedVariant.images;
    } else if (selectedColor) {
      const variantsOfColor = product.variants.filter(v => v.attributes.COLOR === selectedColor);
      newImageList = variantsOfColor.flatMap(v => v.images || []);
    }

    if (newImageList.length === 0) {
      newImageList = product.images || [];
    }

    return [...new Set(newImageList)]; 
  }, [product, selectedColor, selectedVariant]);


  const isSizeDisabled = (size: string) => {
    if (selectedColor && !availableSizesForSelectedColor.includes(size)) {
      return true;
    }
    const variantsForThisSize = variantsBySize[size];
    if (!variantsForThisSize || variantsForThisSize.every(v => v.stockQuantity === 0)) {
      return true;
    }
    return false;
  };

  const isColorDisabled = (color: string) => {
    if (selectedSize && !availableColorsForSelectedSize.includes(color)) {
      return true;
    }
    const variantsForThisColor = variantsByColor[color];
    if (!variantsForThisColor || variantsForThisColor.every(v => v.stockQuantity === 0)) {
      return true;
    }
    return false;
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size === selectedSize ? null : size);
    setQuantity(1);
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color === selectedColor ? null : color);
    setQuantity(1);
  };

  if (!product) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <Spin spinning={loading} size="large" tip="Đang tải sản phẩm...">
      <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
          style={{ marginBottom: '24px' }}
        >
          Quay lại
        </Button>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <div style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: '8px', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                width="100%"
                height="100%"
                src={selectedImage}
                preview={false}
                fallback={NO_IMAGE_PLACEHOLDER}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <Row gutter={[10, 10]} style={{ marginTop: 16, maxHeight: '220px', overflowY: 'auto' }}>
              {imageListToDisplay.map((img, index) => (
                <Col span={4} key={index}>
                  <div style={{ aspectRatio: '1 / 1', border: selectedImage === `${IMAGE_BASE_URL}${img}` ? '2px solid #1677ff' : '2px solid #f0f0f0', borderRadius: '4px', padding: '4px', cursor: 'pointer', transition: 'transform 0.2s ease, border-color 0.2s ease' }}
                       onClick={() => setSelectedImage(`${IMAGE_BASE_URL}${img}`)}
                       onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; if (selectedImage !== `${IMAGE_BASE_URL}${img}`) e.currentTarget.style.borderColor = '#91caff'; }}
                       onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; if (selectedImage !== `${IMAGE_BASE_URL}${img}`) e.currentTarget.style.borderColor = '#f0f0f0'; }}
                  >
                    <Image
                      src={`${IMAGE_BASE_URL}${img}`}
                      preview={false}
                      fallback={NO_IMAGE_PLACEHOLDER}
                      width="100%"
                      height="100%"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
          <Col xs={24} md={12}>
            <Title level={2} style={{ fontWeight: '700', fontSize: '28px' }}>{product.name}</Title>
            <Title level={3} style={{ color: '#d0021b', marginTop: 0, fontWeight: '600' }}>
              {selectedVariant ? `${selectedVariant.sellingPrice.toLocaleString('vi-VN')} ₫` : 'Chọn Size và Màu để xem giá'}
            </Title>
            <Space>
              <Tag color="blue">{product.brandName}</Tag>
              <Tag color="purple">{product.categoryName}</Tag>
            </Space>
            {selectedVariant && <Text>Tồn kho: {selectedVariant.stockQuantity}</Text>}
            <Divider />

            <div>
              <Text strong>Size:</Text>
              <Space wrap style={{ marginTop: 8, marginBottom: 16 }}>
                {allSizes.map(size => (
                  <Button
                    key={size}
                    type={selectedSize === size ? 'primary' : 'default'}
                    onClick={() => handleSelectSize(size)}
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
                {allColors.map(color => (
                  <Button
                    key={color}
                    type={selectedColor === color ? 'primary' : 'default'}
                    onClick={() => handleSelectColor(color)}
                    disabled={isColorDisabled(color)}
                  >
                    {color}
                  </Button>
                ))}
              </Space>
            </div>
            <Divider />

            <div>
              <Text strong>Mô tả sản phẩm:</Text>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                {product.description.split('\n').map((item, index) => (
                  item.trim() && <li key={index}><Paragraph style={{ marginBottom: '4px' }}>{item.trim()}</Paragraph></li>
                ))}
              </ul>
            </div>
            <Divider />

            <Space align="center" size="large" style={{ marginBottom: '24px' }}>
              <InputNumber min={1} max={selectedVariant?.stockQuantity || 1} value={quantity} onChange={(val) => setQuantity(val || 1)} />
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="large"
                onClick={handleAddToCart}
                disabled={!selectedVariant}
              >
                Thêm vào giỏ hàng
              </Button>
            </Space>
            <Divider />
            <Collapse ghost>
              <Collapse.Panel header={<Title level={4} style={{ fontWeight: '600' }}>Đánh giá sản phẩm</Title>} key="1">
                <ReviewSection productId={product.id} />
              </Collapse.Panel>
            </Collapse>
          </Col>
        </Row>
        <Divider />
        <SuggestedProducts currentProductId={product.id} />
      </div>
    </Spin>
  );
};

const SuggestedProducts = ({ currentProductId }: { currentProductId: number }) => {
  const [products, setProducts] = useState<PageResponse<ProductList>>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    productService.getProducts(0, 4)
      .then(res => {
        const filteredProducts = {
          ...res.data,
          content: res.data.content.filter((p: ProductList) => p.id !== currentProductId)
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
      <Title level={3} style={{ fontWeight: '600' }}>Có thể bạn cũng thích</Title>
      <Row gutter={[16, 16]}>
        {products?.content.map((p) => (
          <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
              bodyStyle={{ padding: '16px', flex: '1' }}
              cover={
                <Link to={`/products/${p.id}`} style={{ display: 'block', aspectRatio: '1 / 1' }}>
                  <img alt={p.name} src={`${IMAGE_BASE_URL}${p.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Link>
              }
            >
              <Card.Meta
                title={<Link to={`/products/${p.id}`}><Tooltip title={p.name}>{p.name}</Tooltip></Link>}
                description={<Typography.Text strong style={{ color: '#d0021b' }}>{`${p.minPrice.toLocaleString('vi-VN')} ₫ - ${p.maxPrice.toLocaleString('vi-VN')} ₫`}</Typography.Text>}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

interface Review {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

const authService = {
  getCurrentUser: () => {
    return {
      isLoggedIn: true, 
      name: 'Nguyễn Văn An',
    };
  }
};

const reviewService = {
  getReviewsByProductId: (productId: number): Promise<{ data: Review[] }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockReviews: Review[] = [
          { id: 1, productId: 1, reviewerName: 'Nguyễn Văn A', rating: 5, comment: 'Sản phẩm rất đẹp và chất lượng, giao hàng nhanh.', date: '2023-10-26' },
          { id: 2, productId: 1, reviewerName: 'Trần Thị B', rating: 4, comment: 'Hài lòng với sản phẩm, nhưng giao hàng hơi chậm.', date: '2023-10-25' },
          { id: 3, productId: 1, reviewerName: 'Phạm Văn C', rating: 5, comment: 'Giày đi êm chân, đúng size. Sẽ ủng hộ shop dài dài.', date: '2023-10-24' },
          { id: 4, productId: 2, reviewerName: 'Lê Thị D', rating: 3, comment: 'Màu sắc không như mong đợi lắm, nhưng chất lượng ổn.', date: '2023-10-23' },
        ];
        resolve({ data: mockReviews.filter(r => r.productId === productId) });
      }, 500); 
    });
  },
  submitReview: (review: Omit<Review, 'id' | 'date'>): Promise<{ success: boolean; data: Review }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log("Submitting review:", review);
        const newReview: Review = { ...review, id: Date.now(), date: new Date().toISOString().split('T')[0] };
        resolve({ success: true, data: newReview });
      }, 500);
    });
  }
};

const ReviewSection = ({ productId }: { productId: number }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [form] = Form.useForm();
  const currentUser = authService.getCurrentUser();

  const fetchReviews = () => {
    setLoadingReviews(true);
    reviewService.getReviewsByProductId(productId)
      .then(res => {
        setReviews(res.data);
      })
      .catch(error => {
        console.error("Failed to fetch reviews:", error);
        notification.error({ message: 'Lỗi', description: 'Không thể tải đánh giá sản phẩm.' });
      })
      .finally(() => setLoadingReviews(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const onFinishReview = (values: any) => {
    setSubmittingReview(true);
    const reviewData = {
      ...values,
      productId,
      reviewerName: currentUser.name,
    };
    reviewService.submitReview(reviewData)
      .then(() => {
        notification.success({ message: 'Thành công', description: 'Đánh giá của bạn đã được gửi.' });
        form.resetFields();
        fetchReviews(); 
      })
      .catch(error => {
        console.error("Failed to submit review:", error);
        notification.error({ message: 'Lỗi', description: 'Không thể gửi đánh giá.' });
      })
      .finally(() => setSubmittingReview(false));
  };

  return (
    <>
      <Spin spinning={loadingReviews}>
        <List
          itemLayout="horizontal"
          dataSource={reviews}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.reviewerName}`} />}
                title={<Space>{item.reviewerName} <Rate disabled defaultValue={item.rating} style={{ fontSize: 14 }} /></Space>}
                description={<>
                  <Paragraph>{item.comment}</Paragraph>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.date}</Text>
                </>}
              />
            </List.Item>
          )}
        />
      </Spin>
      <Divider />
      {currentUser.isLoggedIn ? (
        <>
          <Title level={4} style={{ fontWeight: '600' }}>Gửi đánh giá của bạn</Title>
          <Form form={form} onFinish={onFinishReview} layout="vertical">
            <Form.Item name="rating" label="Đánh giá sao" rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}>
              <Rate />
            </Form.Item>
            <Form.Item name="comment" label="Bình luận" rules={[{ required: true, message: 'Vui lòng nhập bình luận của bạn!' }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submittingReview}>
                Gửi đánh giá
              </Button>
            </Form.Item>
          </Form>
        </>
      ) : (
        <Text type="secondary">Vui lòng <Link to="/login">đăng nhập</Link> để gửi đánh giá.</Text>
      )}
    </>
  );
};

export default ProductDetailPage;