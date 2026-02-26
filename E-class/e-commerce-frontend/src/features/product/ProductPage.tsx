import { Col, Row, Typography, Breadcrumb } from 'antd';
import { HomeOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Product from './Products';
import ProductFilterSidebar, { type ProductFilters } from '../home/ProductFilterSidebar';

const ProductPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keywordFromUrl = searchParams.get('keyword') || undefined;

  const [filters, setFilters] = useState<ProductFilters>({
    keyword: keywordFromUrl,
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, keyword: keywordFromUrl }));
  }, [keywordFromUrl]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: 'Sản phẩm' },
        ]}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Typography.Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1a1a2e' }}>
          {filters.keyword
            ? `Kết quả tìm kiếm: "${filters.keyword}"`
            : 'Tất cả sản phẩm'}
        </Typography.Title>
        {filters.keyword && (
          <CloseCircleFilled
            onClick={() => {
              setFilters((prev) => ({ ...prev, keyword: undefined }));
              navigate('/products', { replace: true });
            }}
            style={{ fontSize: 20, color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ff4d4f')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
          />
        )}
      </div>

      <Row gutter={24}>
        <Col xs={24} sm={8} md={6} lg={5}>
          <ProductFilterSidebar filters={filters} onFilterChange={handleFilterChange} />
        </Col>
        <Col xs={24} sm={16} md={18} lg={19}>
          <Product showTitle={false} filters={filters} />
        </Col>
      </Row>
    </div>
  );
};

export default ProductPage;
