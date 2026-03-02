import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';
import { PageResponse, ProductList } from './product.model';
import { Card, Col, Row, Spin, Typography, Tooltip, Empty } from 'antd';
import { Link } from 'react-router-dom';
import type { ProductFilters } from '../home/ProductFilterSidebar';

const { Meta } = Card;
const { Title } = Typography;

interface ProductProps {
  showTitle?: boolean;
  filters?: ProductFilters;
}

const IMAGE_BASE_URL = 'http://localhost:8080/api';

const Product = ({ showTitle = true, filters }: ProductProps) => {
  const [data, setData] = useState<PageResponse<ProductList>>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const hasFilters = filters && (
      filters.keyword || filters.brandId || filters.categoryId ||
      filters.minPrice || filters.maxPrice
    );

    const request = hasFilters
      ? productService.searchProducts({
          keyword: filters.keyword,
          brandId: filters.brandId,
          categoryId: filters.categoryId,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          page: 0,
          size: 12,
        })
      : productService.getProducts(0, 12);

    request
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', marginTop: '50px' }} />;
  }

  return (
    <div style={{ padding: '24px' }}>
      {showTitle && <Title level={2}>Sản phẩm</Title>}
      {data?.content.length === 0 ? (
        <Empty
          description="Không tìm thấy sản phẩm nào"
          style={{ marginTop: 60 }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {data?.content.map((p, index) => (
            <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid #f0f0f0',
                  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  const img = e.currentTarget.querySelector('.product-cover-img') as HTMLImageElement;
                  if (img) img.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  const img = e.currentTarget.querySelector('.product-cover-img') as HTMLImageElement;
                  if (img) img.style.transform = 'scale(1)';
                }}
                bodyStyle={{ padding: '16px', flex: '1' }}
                cover={
                  <Link
                    to={`/products/${p.id}`}
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      aspectRatio: '1 / 1',
                      position: 'relative',
                    }}
                  >
                    <img
                      className="product-cover-img"
                      alt={p.name}
                      src={`${IMAGE_BASE_URL}${p.imageUrl}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                    />
                    {index < 4 && !filters?.keyword && !filters?.brandId && !filters?.categoryId && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          background: '#0052D9',
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 1,
                        }}
                      >
                        MỚI
                      </div>
                    )}
                  </Link>
                }
              >
                <Meta
                  title={
                    <Link to={`/products/${p.id}`} style={{ color: '#1a1a2e' }}>
                      <Tooltip title={p.name}>
                        <div
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontSize: 15,
                            fontWeight: 600,
                            lineHeight: '1.4',
                          }}
                        >
                          {p.name}
                        </div>
                      </Tooltip>
                    </Link>
                  }
                  description={
                    <div style={{ marginTop: 8 }}>
                      <Typography.Text strong style={{ color: '#d0021b', fontSize: 16 }}>
                        {p.minPrice === p.maxPrice
                          ? `${p.minPrice.toLocaleString('vi-VN')} ₫`
                          : `${p.minPrice.toLocaleString('vi-VN')} ₫ - ${p.maxPrice.toLocaleString('vi-VN')} ₫`}
                      </Typography.Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Product;
