import { useState, useEffect } from 'react';
import { Carousel, Typography, Spin, message, Empty } from 'antd';
import ProductListDisplay from '@/features/product/Products';
import { productService } from '@/services/product.service';
import { PageResponse, ProductList as ProductItem } from '@/features/product/product.model';

const { Title } = Typography;

const carouselImageStyle: React.CSSProperties = {
  width: '100%',
  height: '400px',
  objectFit: 'cover',
  objectPosition: 'center',
};

const Home = () => {
  const [products, setProducts] = useState<PageResponse<ProductItem>>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({ page: 0, size: 8 });
        setProducts(res.data);
      } catch (error) {
        message.error('Không thể tải danh sách sản phẩm cho trang chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProducts();
  }, []);

  return (
    <div>
      <Carousel autoplay>
        <div>
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"
            alt="Nike Shoes"
            style={carouselImageStyle}
          />
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1511746315387-c4a76990fdce?q=80&w=2070&auto=format&fit=crop"
            alt="Adidas Shoes"
            style={carouselImageStyle}
          />
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop"
            alt="Jordan Shoes"
            style={carouselImageStyle}
          />
        </div>
      </Carousel>
      <div style={{ padding: '24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          Sản phẩm nổi bật
        </Title>
        <Spin spinning={loading}>
          {products && products.content.length > 0 ? (
            <ProductListDisplay products={products.content} />
          ) : (
            !loading && <Empty description="Hiện chưa có sản phẩm nào." />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default Home;