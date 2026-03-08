import { useEffect, useState } from 'react';
import { Col, Row, Layout, Typography, Spin, Menu, Dropdown, Button, message, Divider, Pagination, Empty } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import ProductListDisplay from './Products'; 
import { productService } from '@/services/product.service';
import { PageResponse, ProductList as ProductItem } from './product.model';

const { Sider, Content } = Layout;
const { Title } = Typography;

const ProductPage = () => {
  const [products, setProducts] = useState<PageResponse<ProductItem>>();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ categoryId?: number | null }>({
    categoryId: null,
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
    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId: any) => {
    setFilters(prevFilters => ({ ...prevFilters, categoryId }));
    setPagination(prev => ({ ...prev, current: 1 })); 
  };

  const categoryMenu = (
    <Menu style={{ fontSize: '15px' }} onClick={(e) => handleCategoryChange(e.key === 'all' ? null : Number(e.key))}>
      <Menu.Item key="all">Tất cả danh mục</Menu.Item>
      {categories.map(cat => (
        <Menu.Item key={cat.id}>{cat.name}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Layout style={{ background: '#fff' }}>
      <Sider
        width={260}
        style={{
          background: '#f9f9f9',
          padding: '24px',
          borderRight: '1px solid #f0f0f0',
          height: 'auto', 
        }}
      >
        <Title level={4} style={{ marginBottom: '20px', fontWeight: 600, color: '#333' }}>Bộ lọc</Title>
        <Divider />

        <Title level={5} style={{ fontWeight: 500, color: '#555', marginBottom: '12px' }}>Danh mục sản phẩm</Title>
        <Dropdown overlay={categoryMenu} trigger={['hover']}>
          <Button
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '40px',
              background: '#fff',
              borderColor: '#d9d9d9',
            }}
          >
            <span style={{ color: filters.categoryId ? '#333' : '#999' }}>
              {filters.categoryId ? categories.find(c => c.id === filters.categoryId)?.name : 'Chọn danh mục'}
            </span>
            <DownOutlined />
          </Button>
        </Dropdown>


      </Sider>
      <Content style={{ padding: '24px' }}>
        <Spin spinning={loading}>
          {products && products.content.length > 0 ? (
            <>
              <ProductListDisplay products={products.content} />
              <Pagination
                style={{ marginTop: 24, textAlign: 'center' }}
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={products.totalElements}
                onChange={(page, pageSize) => setPagination({ current: page, pageSize })}
              />
            </>
          ) : (
            !loading && <Empty description="Không tìm thấy sản phẩm nào phù hợp." />
          )}
        </Spin>
      </Content>
    </Layout>
  );
};

export default ProductPage;