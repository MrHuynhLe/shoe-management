import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Form, Input, Row, Space, Typography, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo-shoe-shop.png";
import { axiosClient } from "@/services/axiosClient";
import { useAuth } from "@/services/AuthContext";

const { Text, Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || "/";

  const onFinish = async (values: any) => {
    try {
      const response = await axiosClient.post("/v1/auth/login", {
        username: values.username,
        password: values.password,
      });

      if (response.status === 200) {
        const data = response.data;
        const user = {
          userId: data.userId,
          username: data.username,
          role: data.role,
        };

        login(data.token, user);
        message.success("Đăng nhập thành công");

        if (data.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        message.error("Tên đăng nhập hoặc mật khẩu không đúng.");
      } else {
        message.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  return (
    <Row
      align="middle"
      justify="center"
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "linear-gradient(135deg, rgba(27,110,234,0.12), rgba(22,163,74,0.08))",
      }}
    >
      <Col xs={24} sm={18} md={12} lg={8} xl={6}>
        <Card style={{ borderRadius: 10 }}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Space direction="vertical" align="center" style={{ width: "100%" }}>
              <img src={logo} alt="S-Shop Logo" style={{ width: 72, height: 72 }} />
              <div style={{ textAlign: "center" }}>
                <Title level={2} style={{ margin: 0 }}>
                  Đăng nhập
                </Title>
                <Text type="secondary">Truy cập tài khoản S-Shop của bạn</Text>
              </div>
            </Space>

            <Form name="login" layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
              </Form.Item>

              <Form.Item>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                  </Form.Item>
                  <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block size="large">
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
