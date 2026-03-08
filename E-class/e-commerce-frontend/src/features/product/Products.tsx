import { Card, Col, Row, Typography, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { ProductList } from './product.model';
 
const { Meta } = Card;
const { Title } = Typography;
 
interface ProductProps {
  products: ProductList[];
}

const ProductListDisplay = ({ products }: ProductProps) => {
 const IMAGE_BASE_URL = 'http://localhost:8080/api';
 
 return (
  <div style={{ padding: '24px' }}>
   <Title level={2}>Danh sách sản phẩm</Title>
   <Row gutter={[16, 16]}>
    {(products || []).map((p) => (
     <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
      <Card
        hoverable
        style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
        bodyStyle={{ padding: '16px', flex: '1' }}
        cover={
          p.imageUrl ? (
            <Link to={`/products/${p.id}`} style={{ display: 'block', aspectRatio: '1 / 1' }}>
              <img alt={p.name} src={`${IMAGE_BASE_URL}${p.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Link>
          ) : (
            <div style={{ aspectRatio: '1 / 1', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography.Text type="secondary">No Image</Typography.Text>
            </div>
          )
        }
      >
        <Meta
          title={<Link to={`/products/${p.id}`}><Tooltip title={p.name}><span>{p.name}</span></Tooltip></Link>}
          description={
            <Typography.Text strong style={{ color: '#d0021b' }}>
              {p.minPrice !== null && p.maxPrice !== null
                ? p.minPrice === p.maxPrice
                  ? `${p.minPrice.toLocaleString('vi-VN')} ₫`
                  : `${p.minPrice.toLocaleString('vi-VN')} ₫ - ${p.maxPrice.toLocaleString('vi-VN')} ₫`
                : 'Chưa có giá'}
            </Typography.Text>
          }
        />
      </Card>
     </Col>
    ))}
   </Row>
  </div>
 );
};
 
export default ProductListDisplay;
