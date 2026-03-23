import { Card, Col, Row, Typography, Tooltip } from "antd";
import { Link } from "react-router-dom";
import { ProductList } from "./product.model";
import { resolveImageUrl } from "@/utils/utils";

const { Meta } = Card;
const { Title, Text } = Typography;

interface ProductProps {
  products: ProductList[];
}

const ProductListDisplay = ({ products }: ProductProps) => {
  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Danh sách sản phẩm</Title>

      <Row gutter={[16, 16]}>
        {(products || []).map((p: any) => {
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
            <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
                styles={{ body: { padding: "16px", flex: 1 } }}
                cover={
                  imageUrl ? (
                    <Link
                      to={`/products/${p.id}`}
                      style={{ display: "block", aspectRatio: "1 / 1" }}
                    >
                      <img
                        alt={p.name}
                        src={imageUrl}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          console.error("IMAGE LOAD ERROR:", p.name, imageUrl);
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='24'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </Link>
                  ) : (
                    <div
                      style={{
                        aspectRatio: "1 / 1",
                        background: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        padding: 12,
                        textAlign: "center",
                        gap: 8,
                      }}
                    >
                      <Text type="secondary">No Image</Text>
                      <Text style={{ fontSize: 12 }}>{String(rawImage)}</Text>
                    </div>
                  )
                }
              >
                <Meta
                  title={
                    <Link to={`/products/${p.id}`}>
                      <Tooltip title={p.name}>
                        <span>{p.name}</span>
                      </Tooltip>
                    </Link>
                  }
                  description={
                    <Typography.Text strong style={{ color: "#d0021b" }}>
                      {p.minPrice !== null && p.maxPrice !== null
                        ? p.minPrice === p.maxPrice
                          ? `${p.minPrice.toLocaleString("vi-VN")} ₫`
                          : `${p.minPrice.toLocaleString("vi-VN")} ₫ - ${p.maxPrice.toLocaleString("vi-VN")} ₫`
                        : "Chưa có giá"}
                    </Typography.Text>
                  }
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default ProductListDisplay;