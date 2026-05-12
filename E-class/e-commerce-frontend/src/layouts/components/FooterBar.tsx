import { Col, Divider, Layout, Row } from "antd";

const { Footer } = Layout;

const FooterBar = () => {
  return (
    <Footer className="app-footer">
      <Row gutter={[32, 24]} style={{ maxWidth: 1440, margin: "0 auto" }}>
        <Col xs={24} md={6}>
          <h3>S-Shop Online</h3>
          <p>
            Cửa hàng giày chính hãng, tập trung vào trải nghiệm mua sắm rõ ràng
            và tin cậy.
          </p>
        </Col>

        <Col xs={24} md={6}>
          <h4>Hệ thống cửa hàng</h4>
          <p>25 Xuân Phương, Nam Từ Liêm, Hà Nội</p>
          <p>120 Phương Canh, Nam Từ Liêm, Hà Nội</p>
        </Col>

        <Col xs={24} md={6}>
          <h4>Chính sách</h4>
          <p>
            <a href="#">Chính sách đổi trả</a>
          </p>
          <p>
            <a href="#">Chính sách bảo hành</a>
          </p>
          <p>
            <a href="#">Chính sách vận chuyển</a>
          </p>
        </Col>

        <Col xs={24} md={6}>
          <h4>Liên hệ</h4>
          <p>
            Hotline: <strong style={{ color: "#93c5fd" }}>0389 225 7999</strong>
          </p>
          <p>Email: support@sshop.vn</p>
        </Col>
      </Row>

      <Divider style={{ borderColor: "rgba(255, 255, 255, 0.18)" }} />

      <div style={{ color: "rgba(255, 255, 255, 0.48)", textAlign: "center" }}>
        © {new Date().getFullYear()} S-Shop Online. All rights reserved.
      </div>
    </Footer>
  );
};

export default FooterBar;
