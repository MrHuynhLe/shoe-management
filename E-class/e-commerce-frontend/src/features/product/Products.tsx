import { Card, Col, Empty, Row, Space, Tooltip, Typography } from "antd";
import { Link } from "react-router-dom";
import { ProductList } from "./product.model";
import { resolveImageUrl } from "@/utils/utils";

const { Meta } = Card;
const { Text, Title } = Typography;

interface ProductProps {
  products: ProductList[];
  hideTitle?: boolean;
}

const fallbackImage =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f6fb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23667085' font-size='22'%3ENo Image%3C/text%3E%3C/svg%3E";

const formatPrice = (product: any) => {
  if (product.minPrice == null || product.maxPrice == null) {
    return "Chưa có giá";
  }

  if (product.minPrice === product.maxPrice) {
    return `${Number(product.minPrice).toLocaleString("vi-VN")} ₫`;
  }

  return `${Number(product.minPrice).toLocaleString("vi-VN")} ₫ - ${Number(
    product.maxPrice,
  ).toLocaleString("vi-VN")} ₫`;
};

const ProductListDisplay = ({ products, hideTitle = false }: ProductProps) => {
  if (!products?.length) {
    return <Empty description="Không có sản phẩm để hiển thị" />;
  }

  return (
    <Space direction="vertical" size={20} className="product-grid">
      {!hideTitle && (
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Danh sách sản phẩm
          </Title>
          <Text type="secondary">Chọn sản phẩm để xem size, màu và tồn kho</Text>
        </div>
      )}

      <Row gutter={[18, 18]}>
        {products.map((p: any) => {
          const rawImage =
            p?.imageUrl ||
            p?.image_url ||
            p?.primaryImage ||
            p?.primary_image ||
            p?.thumbnail ||
            p?.thumbUrl ||
            p?.thumb_url ||
            p?.images?.[0]?.imageUrl ||
            p?.images?.[0]?.image_url ||
            "";

          const imageUrl = resolveImageUrl(rawImage);

          return (
            <Col key={p.id} xs={24} sm={12} md={8} xl={6}>
              <Card
                hoverable
                className="product-card"
                styles={{ body: { padding: 16 } }}
                cover={
                  <Link to={`/products/${p.id}`} className="product-card-cover">
                    <img
                      alt={p.name}
                      src={imageUrl || fallbackImage}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackImage;
                      }}
                    />
                  </Link>
                }
              >
                <Meta
                  title={
                    <Link to={`/products/${p.id}`}>
                      <Tooltip title={p.name}>
                        <span className="product-card-title">{p.name}</span>
                      </Tooltip>
                    </Link>
                  }
                  description={<span className="product-price">{formatPrice(p)}</span>}
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </Space>
  );
};

export default ProductListDisplay;
