import { useEffect, useState } from 'react';
import { Layout, Typography, Spin, Menu, Button, message, Divider, Pagination, Empty, Space } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import ProductListDisplay from './Products'; 
import { productService } from '@/services/product.service';
import { PageResponse, ProductList as ProductItem } from './product.model';

const { Sider, Content } = Layout;
const { Title } = Typography;

const ProductPage = () => {
  const [products, setProducts] = useState<PageResponse<ProductItem>>();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ categoryId?: number | null; brandId?: number | null }>({
    categoryId: null,
    brandId: null,
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12 });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.current - 1,
          size: pagination.pageSize,
          categoryId: filters.categoryId,
          brandId: filters.brandId,
        };
        const res = await productService.getProducts(params);
        setProducts(res.data);
      } catch (error) {
        message.error('Không thể tải danh sách sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, pagination]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productService.getCategories();
        setCategories(res.data || []);
      } catch (error) {
        message.error('Không thể tải danh sách danh mục.');
      }
    };
    const fetchBrands = async () => {
      try {
        const res = await productService.getBrands();
        setBrands(res.data || []);
      } catch (error) {
        message.error('Không thể tải danh sách thương hiệu.');
      }
    };
    fetchCategories();
    fetchBrands();
  }, []);

  const handleCategoryChange = (categoryId: any) => {
    setFilters(prevFilters => ({ ...prevFilters, categoryId }));
    setPagination(prev => ({ ...prev, current: 1 })); 
  };
  const handleBrandChange = (brandId: any) => {
    setFilters(prevFilters => ({ ...prevFilters, brandId }));
    setPagination(prev => ({ ...prev, current: 1 })); 
  };

  const handleResetFilters = () => {
    setFilters({ categoryId: null, brandId: null });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  return (
    <Layout style={{ background: '#f5f7fa' }}>
      <Sider
        width={260}
        style={{
          background: '#fff',
          padding: '24px',
          borderRight: '1px solid #f0f0f0',
          height: 'auto',
          margin: '16px 0 16px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0, fontWeight: 600, color: '#333' }}>Bộ lọc</Title>
          <Button
            type="text"
            icon={<ClearOutlined />}
            onClick={handleResetFilters}
            disabled={!filters.categoryId && !filters.brandId}
          >
            Xóa bộ lọc
          </Button>
        </Space>
        <Divider />

        <Title level={5} style={{ fontWeight: 600, color: '#444', marginBottom: '12px' }}>Danh mục</Title>
        <Menu
          onClick={(e) => handleCategoryChange(e.key === 'all' ? null : Number(e.key))}
          selectedKeys={filters.categoryId ? [String(filters.categoryId)] : ['all']}
          mode="inline"
          style={{ border: 'none', background: 'transparent' }}
          items={[
            { key: 'all', label: 'Tất cả' },
            ...categories.map(cat => ({ key: cat.id, label: cat.name }))
          ]}
        />

        <Divider />

        <Title level={5} style={{ fontWeight: 600, color: '#444', marginBottom: '12px' }}>Thương hiệu</Title>
        <Menu
          onClick={(e) => handleBrandChange(e.key === 'all' ? null : Number(e.key))}
          selectedKeys={filters.brandId ? [String(filters.brandId)] : ['all']}
          mode="inline"
          style={{ border: 'none', background: 'transparent' }}
          items={[
            { key: 'all', label: 'Tất cả' },
            ...brands.map(brand => ({ key: brand.id, label: brand.name }))
          ]}
        />

      </Sider>
      <Content style={{ padding: '16px' }}>
        <Spin spinning={loading}>
          {products && products.content.length > 0 ? (
            <>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <ProductListDisplay products={products.content} />
              </div>
              <Pagination
                style={{ marginTop: 24, textAlign: 'center' }}
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={products.totalElements}
                onChange={(page, pageSize) => setPagination({ current: page, pageSize })}
              />
            </>
          ) : (
            !loading && (
              <div style={{ background: '#fff', padding: '48px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Empty description="Không tìm thấy sản phẩm nào phù hợp." />
              </div>
            )
          )}
        </Spin>
      </Content>
    </Layout>
  );
};

export default ProductPage;