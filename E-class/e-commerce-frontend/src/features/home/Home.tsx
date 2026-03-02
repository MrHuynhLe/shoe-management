import { Carousel, Typography, Row, Col, Button, Space, Input } from 'antd';
import {
  CarOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Product from '@/features/product/Products';

const { Title, Text, Paragraph } = Typography;

/* ─── DATA ─────────────────────────────────────────────── */

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop',
    subtitle: 'BỘ SƯU TẬP MỚI 2026',
    title: 'Bước Đi Phong Cách',
    description: 'Khám phá những đôi giày hot nhất từ các thương hiệu hàng đầu thế giới.',
  },
  {
    image: 'https://images.unsplash.com/photo-1511746315387-c4a76990fdce?q=80&w=2070&auto=format&fit=crop',
    subtitle: 'CHÍNH HÃNG 100%',
    title: 'Giày Thể Thao Cao Cấp',
    description: 'Chất lượng vượt trội, thiết kế độc đáo, giá tốt nhất thị trường.',
  },
  {
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop',
    subtitle: 'ƯU ĐÃI ĐẶC BIỆT',
    title: 'Giảm Đến 50%',
    description: 'Chương trình khuyến mãi siêu hấp dẫn cho mùa hè này.',
  },
];

const categories = [
  { key: 'men', label: 'Giày Nam', image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&auto=format&fit=crop' },
  { key: 'women', label: 'Giày Nữ', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop' },
  { key: 'sport', label: 'Thể Thao', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&auto=format&fit=crop' },
  { key: 'premium', label: 'Cao Cấp', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop' },
];

const brandNames = ['NIKE', 'ADIDAS', 'JORDAN', 'PUMA', 'NEW BALANCE', 'CONVERSE'];

const benefits = [
  { icon: <CarOutlined style={{ fontSize: 36, color: '#69b1ff' }} />, title: 'Miễn phí vận chuyển', desc: 'Cho đơn hàng từ 500.000₫' },
  { icon: <SafetyCertificateOutlined style={{ fontSize: 36, color: '#69b1ff' }} />, title: 'Bảo hành 12 tháng', desc: 'Đổi trả miễn phí 30 ngày' },
  { icon: <CheckCircleOutlined style={{ fontSize: 36, color: '#69b1ff' }} />, title: 'Chính hãng 100%', desc: 'Cam kết hàng chính hãng' },
  { icon: <CustomerServiceOutlined style={{ fontSize: 36, color: '#69b1ff' }} />, title: 'Hỗ trợ 24/7', desc: 'Hotline: 0389 225 7999' },
];

/* ─── COMPONENT ────────────────────────────────────────── */

const Home = () => {
  return (
    <div>
      {/* ══════ SECTION 1: HERO BANNER ══════ */}
      <div style={{ position: 'relative' }}>
        <Carousel autoplay autoplaySpeed={5000} effect="fade">
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div
                style={{
                  height: 600,
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                {/* Gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(135deg, rgba(26,26,46,0.85) 0%, rgba(0,82,217,0.5) 50%, transparent 100%)',
                  }}
                />
                {/* Text content */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 48,
                    transform: 'translateY(-50%)',
                    maxWidth: 600,
                    zIndex: 2,
                  }}
                >
                  <Text
                    style={{
                      color: '#69b1ff',
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                    }}
                  >
                    {slide.subtitle}
                  </Text>
                  <Title
                    level={1}
                    style={{
                      color: '#fff',
                      fontSize: 48,
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      margin: '12px 0',
                      lineHeight: 1.1,
                    }}
                  >
                    {slide.title}
                  </Title>
                  <Paragraph
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: 18,
                      marginBottom: 32,
                      lineHeight: 1.6,
                    }}
                  >
                    {slide.description}
                  </Paragraph>
                  <Space size={16}>
                    <Link to="/products">
                      <Button
                        type="primary"
                        size="large"
                        style={{
                          height: 52,
                          padding: '0 40px',
                          fontSize: 16,
                          fontWeight: 600,
                          borderRadius: 8,
                          background: '#0052D9',
                          borderColor: '#0052D9',
                        }}
                      >
                        Mua ngay
                      </Button>
                    </Link>
                    <Link to="/products">
                      <Button
                        size="large"
                        ghost
                        style={{
                          height: 52,
                          padding: '0 40px',
                          fontSize: 16,
                          fontWeight: 600,
                          borderRadius: 8,
                          color: '#fff',
                          borderColor: '#fff',
                        }}
                      >
                        Khám phá
                      </Button>
                    </Link>
                  </Space>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* ══════ SECTION 2: DANH MỤC SẢN PHẨM ══════ */}
      <div style={{ padding: '80px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#1a1a2e' }}>
            Danh mục sản phẩm
          </Title>
          <Paragraph style={{ color: '#6b7280', fontSize: 16, marginBottom: 48 }}>
            Tìm giày phù hợp với phong cách của bạn
          </Paragraph>
          <Row gutter={[24, 24]}>
            {categories.map((cat) => (
              <Col key={cat.key} xs={24} sm={12} md={6}>
                <Link to="/products">
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: 12,
                      overflow: 'hidden',
                      height: 320,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                      if (img) img.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                      if (img) img.style.transform = 'scale(1)';
                    }}
                  >
                    <img
                      src={cat.image}
                      alt={cat.label}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: 24,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>
                        {cat.label}
                      </Text>
                    </div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* ══════ SECTION 3: SẢN PHẨM NỔI BẬT ══════ */}
      <div style={{ padding: '80px 48px', background: '#f5f5f7' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title level={2} style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#1a1a2e' }}>
              Sản phẩm nổi bật
            </Title>
            <Paragraph style={{ color: '#6b7280', fontSize: 16 }}>
              Những đôi giày được yêu thích nhất tại S-Shop
            </Paragraph>
          </div>
          <Product showTitle={false} />
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/products">
              <Button
                size="large"
                style={{
                  height: 48,
                  padding: '0 48px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 8,
                  borderColor: '#1a1a2e',
                  color: '#1a1a2e',
                }}
              >
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════ SECTION 4: BRAND LOGOS ══════ */}
      <div
        style={{
          padding: '60px 48px',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Row justify="space-around" align="middle">
            {brandNames.map((brand) => (
              <Col key={brand}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#d1d5db',
                    letterSpacing: 3,
                    transition: 'color 0.3s ease',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1a1a2e')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#d1d5db')}
                >
                  {brand}
                </Text>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* ══════ SECTION 5: BENEFITS STRIP ══════ */}
      <div style={{ padding: '48px', background: '#1a1a2e' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Row gutter={[32, 24]} justify="space-around">
            {benefits.map((b) => (
              <Col key={b.title} xs={12} md={6} style={{ textAlign: 'center' }}>
                {b.icon}
                <Title
                  level={5}
                  style={{ color: '#fff', marginTop: 12, marginBottom: 4, fontSize: 16 }}
                >
                  {b.title}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                  {b.desc}
                </Text>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* ══════ SECTION 6: NEWSLETTER ══════ */}
      <div
        style={{
          padding: '80px 48px',
          background: 'linear-gradient(135deg, #0052D9 0%, #1a1a2e 100%)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Title level={2} style={{ color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Đăng ký nhận tin ưu đãi
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 32 }}>
            Nhận ngay voucher giảm 10% cho đơn hàng đầu tiên
          </Paragraph>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Nhập email của bạn..."
              size="large"
              style={{ height: 52, fontSize: 16, borderRadius: '8px 0 0 8px' }}
            />
            <Button
              type="primary"
              size="large"
              style={{
                height: 52,
                padding: '0 32px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: '0 8px 8px 0',
                background: '#d0021b',
                borderColor: '#d0021b',
              }}
            >
              Đăng ký
            </Button>
          </Space.Compact>
        </div>
      </div>
    </div>
  );
};

export default Home;
