import { Row, Col, Typography, Form, Input, Button, Card, Breadcrumb, Space, notification } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const contactInfo = [
  {
    icon: <PhoneOutlined style={{ fontSize: 28, color: '#0052D9' }} />,
    title: 'Điện thoại',
    value: '0389 225 7999',
  },
  {
    icon: <MailOutlined style={{ fontSize: 28, color: '#0052D9' }} />,
    title: 'Email',
    value: 'support@sshop.vn',
  },
  {
    icon: <EnvironmentOutlined style={{ fontSize: 28, color: '#0052D9' }} />,
    title: 'Địa chỉ',
    value: '25 Xuân Phương, Nam Từ Liêm, Hà Nội',
  },
  {
    icon: <ClockCircleOutlined style={{ fontSize: 28, color: '#0052D9' }} />,
    title: 'Giờ làm việc',
    value: 'T2 - T7: 8:00 - 21:00',
  },
];

const Contact = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const { name, email, phone, subject, message } = values;
    const mailBody = `Tên: ${name}\nEmail: ${email}\nSố điện thoại: ${phone || 'Không có'}\n\n${message}`;
    const mailtoLink = `mailto:support@sshop.vn?subject=${encodeURIComponent(subject || 'Liên hệ từ website')}&body=${encodeURIComponent(mailBody)}`;
    window.location.href = mailtoLink;
    notification.success({
      message: 'Đã mở ứng dụng email',
      description: 'Vui lòng gửi email để hoàn tất liên hệ.',
    });
  };

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 32 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: 'Liên hệ' },
        ]}
      />

      {/* Page Title */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={2} style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#1a1a2e' }}>
          Liên hệ với chúng tôi
        </Title>
        <Paragraph style={{ color: '#6b7280', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
          Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua bất kỳ kênh nào dưới đây.
        </Paragraph>
      </div>

      {/* Contact Info Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        {contactInfo.map((info) => (
          <Col key={info.title} xs={24} sm={12} md={6}>
            <Card
              style={{
                textAlign: 'center',
                borderRadius: 12,
                height: '100%',
                border: '1px solid #f0f0f0',
                transition: 'box-shadow 0.3s ease, transform 0.2s ease',
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(0,82,217,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                {info.icon}
              </div>
              <Title level={5} style={{ marginBottom: 4 }}>{info.title}</Title>
              <Text style={{ color: '#6b7280' }}>{info.value}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Contact Form + Map */}
      <Row gutter={[32, 32]} style={{ marginBottom: 48 }}>
        <Col xs={24} md={12}>
          <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0', height: '100%' }}>
            <Title level={4} style={{ marginBottom: 24, color: '#1a1a2e' }}>
              Gửi tin nhắn cho chúng tôi
            </Title>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                  >
                    <Input size="large" placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                  >
                    <Input size="large" placeholder="email@example.com" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="phone" label="Số điện thoại">
                    <Input size="large" placeholder="0389 225 7999" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="subject"
                    label="Chủ đề"
                    rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}
                  >
                    <Input size="large" placeholder="Hỏi về sản phẩm" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="message"
                label="Nội dung"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              >
                <Input.TextArea
                  rows={5}
                  placeholder="Nhập nội dung tin nhắn..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SendOutlined />}
                  style={{
                    height: 48,
                    padding: '0 40px',
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 8,
                    background: '#0052D9',
                  }}
                >
                  Gửi tin nhắn
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #f0f0f0',
              height: '100%',
              overflow: 'hidden',
            }}
            bodyStyle={{ padding: 0, height: '100%' }}
          >
            <iframe
              title="S-Shop Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863855858907!2d105.7425!3d21.0381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b32b842a37%3A0xc7e2bdd0c6d9c74f!2zWHXDom4gUGjGsMahbmcsIE5hbSBU4burIExpw6ptLCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1709000000000"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 480, borderRadius: 12 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </Col>
      </Row>

      {/* Working Hours */}
      <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0', textAlign: 'center' }}>
        <ClockCircleOutlined style={{ fontSize: 36, color: '#0052D9', marginBottom: 16 }} />
        <Title level={4} style={{ marginBottom: 16, color: '#1a1a2e' }}>Giờ làm việc</Title>
        <Row gutter={[32, 16]} justify="center">
          <Col>
            <Text strong>Thứ 2 - Thứ 6:</Text>
            <br />
            <Text>8:00 - 21:00</Text>
          </Col>
          <Col>
            <Text strong>Thứ 7:</Text>
            <br />
            <Text>8:00 - 20:00</Text>
          </Col>
          <Col>
            <Text strong>Chủ nhật:</Text>
            <br />
            <Text>9:00 - 18:00</Text>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Contact;
