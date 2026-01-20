import { Carousel, Typography } from 'antd';
import Product from '@/features/product/Products';

const { Title } = Typography;

const carouselImageStyle: React.CSSProperties = {
  width: '100%',
  height: '400px',
  objectFit: 'cover',
  objectPosition: 'center',
};

const Home = () => {
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
        <Title level={2} style={{ marginBottom: '24px' }}>
          Sản phẩm nổi bật
        </Title>
        <Product showTitle={false} />
      </div>
    </div>
  );
};

export default Home;