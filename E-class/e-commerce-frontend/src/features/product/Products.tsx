import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';
import { PageResponse, ProductList } from './product.model';
import { Card, Col, Row, Spin, Typography, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
 
const { Meta } = Card;
const { Title } = Typography;
 
interface ProductProps {
  showTitle?: boolean;
}

const Product = ({ showTitle = true }: ProductProps) => {
 const [data, setData] = useState<PageResponse<ProductList>>();
 const [loading, setLoading] = useState(false);
 const IMAGE_BASE_URL = 'http://localhost:8080/api';
 useEffect(() => {
  setLoading(true);
  productService
   .getProducts(0, 12)
   .then((res) => setData(res.data))
   .finally(() => setLoading(false));
 }, []);
 
 if (loading) {
  return <Spin size="large" style={{ display: 'block', marginTop: '50px' }} />;
 }
 
 return (
  <div style={{ padding: '24px' }}>
   {showTitle && <Title level={2}>Sản phẩm</Title>}
   <Row gutter={[16, 16]}>
    {data?.content.map((p) => (
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
        <Meta
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
 
export default Product;
