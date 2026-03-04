import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Form, Input, Typography, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { setAuthToken } from "@/services/axiosClient"; // <-- thêm hàm này (mẫu ở dưới)
import { authService } from "@/services/auth.service";

const { Title } = Typography;

type LoginFormValues = {
  usernameOrEmail: string;
  password: string;
  remember?: boolean;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

 const onFinish = async (values: LoginFormValues) => {
  try {
    const res = await authService.login({
      usernameOrEmail: values.usernameOrEmail,
      password: values.password,
    });

    // 1) lưu localStorage
    localStorage.setItem("access_token", res.token);
    localStorage.setItem("role", res.role);
    localStorage.setItem("permissions", JSON.stringify(res.permissions || []));

    // 2) set token cho axios
    setAuthToken(res.token);

    message.success("Đăng nhập thành công!");

    // 3) nếu trước đó bị đá từ trang protected -> quay lại trang đó
    const from = (location.state as any)?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    // 4) điều hướng theo role
const role = (res.role || "").replace("ROLE_", "");

console.log("navigating to admin now...", role);

navigate(role === "ADMIN" ? "/admin" : "/", { replace: true });
  } catch (err: any) {
    const msg = err?.response?.data?.message || "Đăng nhập thất bại!";
    message.error(msg);
    console.error(err);
  }
};

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Đăng nhập
        </Title>

        <Form<LoginFormValues> name="login" onFinish={onFinish}>
          <Form.Item
            name="usernameOrEmail"
            rules={[
              { required: true, message: "Vui lòng nhập username/email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username hoặc Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
