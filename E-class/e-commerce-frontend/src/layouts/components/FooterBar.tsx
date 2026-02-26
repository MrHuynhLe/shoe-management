import { Layout, Row, Col, Divider, Space } from 'antd';
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
} from '@ant-design/icons';
import logo from '@/assets/logo-shoe-shop.png';

const { Footer } = Layout;

const FooterBar = () => {
  return (
    <Footer style={{ background: '#0a0a1a', color: 'rgba(255, 255, 255, 0.65)', padding: '60px 48px 40px' }}>
      <Row gutter={[32, 24]}>
        <Col xs={24} md={6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <img src={logo} alt="S-Shop" style={{ height: 36 }} />
            <h3 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 700 }}>
              S-Shop Online
            </h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
            Cửa hàng giày chính hãng – cam kết chất lượng – giá tốt nhất.
          </p>
        </Col>
        <Col xs={24} md={6}>
          <h4 style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 16 }}>Hệ thống cửa hàng</h4>
          <p>25 Xuân Phương, Nam Từ Liêm, Hà Nội</p>
          <p>120 Phương Canh, Nam Từ Liêm, Hà Nội</p>
        </Col>
        <Col xs={24} md={6}>
          <h4 style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 16 }}>Chính sách</h4>
          <p><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Chính sách đổi trả</a></p>
          <p><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Chính sách bảo hành</a></p>
          <p><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Chính sách vận chuyển</a></p>
        </Col>
        <Col xs={24} md={6}>
          <h4 style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 16 }}>Liên hệ</h4>
          <p>
            Hotline:{' '}
            <strong style={{ color: '#69b1ff' }}>
              0389 225 7999
            </strong>
          </p>
          <p>Email: support@sshop.vn</p>
        </Col>
      </Row>

      <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.15)', margin: '32px 0 24px' }} />

      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#888', marginBottom: 16 }}>
          © {new Date().getFullYear()} S-Shop Online. All rights reserved.
        </div>
        <Space size={24}>
          {[
            { icon: <FacebookOutlined />, href: '#' },
            { icon: <InstagramOutlined />, href: '#' },
            { icon: <YoutubeOutlined />, href: '#' },
          ].map((social, index) => (
            <a
              key={index}
              href={social.href}
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: 22, transition: 'color 0.3s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              {social.icon}
            </a>
          ))}
        </Space>
      </div>
    </Footer>
  );
};

export default FooterBar;
