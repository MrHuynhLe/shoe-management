import { Col, Row } from 'antd';
import Product from './Products';
import ProductFilterSidebar from '../home/ProductFilterSidebar';

const ProductPage = () => {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={8} md={6} lg={5}>
        <ProductFilterSidebar />
      </Col>
      <Col xs={24} sm={16} md={18} lg={19}>
        <Product showTitle />
      </Col>
    </Row>
  );
};

export default ProductPage;