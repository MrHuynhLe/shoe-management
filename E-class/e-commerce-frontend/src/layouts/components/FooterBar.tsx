import { Layout, Row, Col, Divider } from 'antd'

const { Footer } = Layout

const FooterBar = () => {
  return (
    <Footer style={{ background: '#001529', color: 'rgba(255, 255, 255, 0.65)', padding: '40px 48px' }}>
      <Row gutter={[32, 24]}>
        <Col xs={24} md={6}>
          <h3 style={{ color: '#fff', marginBottom: 16 }}>
            S-Shop Online
          </h3>
          <p style={{ color: '#555' }}>
            Cửa hàng giày chính hãng – cam kết chất lượng – giá tốt nhất.
          </p>
        </Col>
        <Col xs={24} md={6}>
          <h4 style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Hệ thống cửa hàng</h4>
          <p>25 Xuân Phương, Nam Từ Liêm, Hà Nội</p>
          <p>120 Phương Canh, Nam Từ Liêm, Hà Nội</p>
        </Col>
        <Col xs={24} md={6}>
          <h4 style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Chính sách</h4>
          <p><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Chính sách đổi trả</a></p>
          <p><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Chính sách bảo hành</a></p>
          <p><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Chính sách vận chuyển</a></p>
        </Col>
        <Col xs={24} md={6}>
          <h4 style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Liên hệ</h4>
          <p>
            Hotline:{' '}
            <strong style={{ color: '#69b1ff' }}>
              0389 225 7999
            </strong>
          </p>
          <p>Email: support@sshop.vn</p>
        </Col>
      </Row>

      <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.25)' }} />

      <div style={{ textAlign: 'center', color: '#888' }}>
        © {new Date().getFullYear()} S-Shop Online. All rights reserved.
      </div>
    </Footer>
  )
}

export default FooterBar
