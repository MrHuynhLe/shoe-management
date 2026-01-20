import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';
import { PageResponse, ProductList } from './product.model';
import { Card, Col, Row, Spin, Typography } from 'antd';
 
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
       cover={<img alt={p.name} src={`${IMAGE_BASE_URL}${p.imageUrl}`} style={{ height: 200, objectFit: 'cover' }} />}
      >
       <Meta title={p.name} description={`${p.minPrice} - ${p.maxPrice}`} />
      </Card>
     </Col>
    ))}
   </Row>
  </div>
 );
};
 
export default Product;
