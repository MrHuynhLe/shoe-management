import { useEffect, useState } from "react";
import { Button, Carousel, Col, Empty, Row, Space, Spin, Typography, message } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import ProductListDisplay from "@/features/product/Products";
import { productService } from "@/services/product.service";
import {
  PageResponse,
  ProductList as ProductItem,
} from "@/features/product/product.model";

const { Text, Title } = Typography;

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
    title: "Giày chính hãng cho mọi chuyển động",
    description: "Khám phá các mẫu sneaker, running và lifestyle mới nhất.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1511746315387-c4a76990fdce?q=80&w=2070&auto=format&fit=crop",
    title: "Dễ chọn size, rõ giá, giao nhanh",
    description: "Trải nghiệm mua sắm gọn gàng từ xem sản phẩm đến thanh toán.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop",
    title: "Bộ sưu tập nổi bật",
    description: "Những thiết kế được khách hàng quan tâm nhiều nhất.",
  },
];

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
        message.error("Không thể tải danh sách sản phẩm cho trang chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProducts();
  }, []);

  return (
    <Space direction="vertical" size={28} style={{ width: "100%" }}>
      <Carousel autoplay dots>
        {slides.map((slide) => (
          <div key={slide.title}>
            <div
              style={{
                alignItems: "center",
                background: `linear-gradient(90deg, rgba(8, 18, 38, 0.78), rgba(8, 18, 38, 0.2)), url(${slide.image}) center/cover`,
                borderRadius: 10,
                display: "flex",
                minHeight: 420,
                overflow: "hidden",
                padding: "48px clamp(24px, 6vw, 72px)",
              }}
            >
              <Space direction="vertical" size={18} style={{ maxWidth: 560 }}>
                <Title
                  level={1}
                  style={{
                    color: "#fff",
                    fontSize: "clamp(32px, 5vw, 56px)",
                    lineHeight: 1.05,
                    margin: 0,
                  }}
                >
                  {slide.title}
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.82)", fontSize: 18 }}>
                  {slide.description}
                </Text>
                <Link to="/products">
                  <Button type="primary" size="large" icon={<ArrowRightOutlined />}>
                    Xem sản phẩm
                  </Button>
                </Link>
              </Space>
            </div>
          </div>
        ))}
      </Carousel>

      <Row gutter={[16, 16]}>
        {[
          ["Chính hãng", "Nguồn gốc sản phẩm rõ ràng"],
          ["Dễ đổi trả", "Hỗ trợ đổi size theo chính sách"],
          ["Thanh toán linh hoạt", "Tiền mặt, chuyển khoản và VNPay"],
        ].map(([title, desc]) => (
          <Col xs={24} md={8} key={title}>
            <div className="app-section" style={{ padding: 20, height: "100%" }}>
              <Title level={5} style={{ marginTop: 0 }}>
                {title}
              </Title>
              <Text type="secondary">{desc}</Text>
            </div>
          </Col>
        ))}
      </Row>

      <div className="app-section" style={{ padding: 24 }}>
        <Space
          align="center"
          style={{ justifyContent: "space-between", width: "100%", marginBottom: 20 }}
          wrap
        >
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Sản phẩm nổi bật
            </Title>
            <Text type="secondary">Các mẫu đang được cập nhật trong cửa hàng</Text>
          </div>
          <Link to="/products">
            <Button>Xem tất cả</Button>
          </Link>
        </Space>

        <Spin spinning={loading}>
          {products && products.content.length > 0 ? (
            <ProductListDisplay products={products.content} hideTitle />
          ) : (
            !loading && <Empty description="Hiện chưa có sản phẩm nào." />
          )}
        </Spin>
      </div>
    </Space>
  );
};

export default Home;
