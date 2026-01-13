import { Layout, Row, Col, Divider } from 'antd'

const { Footer } = Layout

const FooterBar = () => {
  return (
    <Footer style={{ background: '#f5f5f5', padding: '24px 64px' }}>
      <Row gutter={[32, 24]}>
        <Col xs={24} md={6}>
          <h3 style={{ color: '#00b96b', marginBottom: 12 }}>
            S-Shop Online
          </h3>
          <p style={{ color: '#555' }}>
            Cửa hàng giày chính hãng – cam kết chất lượng – giá tốt nhất.
          </p>
        </Col>
        <Col xs={24} md={6}>
          <h4>Hệ thống cửa hàng</h4>
          <p>25 Xuân Phương, Nam Từ Liêm</p>
          <p>Phương Canh, Hà Nội</p>
        </Col>
        <Col xs={24} md={6}>
          <h4>Chính sách</h4>
          <p>Chính sách đổi trả</p>
          <p>Chính sách bảo hành</p>
          <p>Chính sách vận chuyển</p>
        </Col>
        <Col xs={24} md={6}>
          <h4>Liên hệ</h4>
          <p>
            Hotline:{' '}
            <strong style={{ color: 'red' }}>
              0389 225 799
            </strong>
          </p>
          <p>Email: support@sshop.vn</p>
        </Col>
      </Row>

      <Divider />

      <div style={{ textAlign: 'center', color: '#888' }}>
        © {new Date().getFullYear()} S-Shop Online. All rights reserved.
      </div>
    </Footer>
  )
}

export default FooterBar
