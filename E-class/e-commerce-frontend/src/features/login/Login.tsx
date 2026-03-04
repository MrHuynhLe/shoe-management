import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '@/services/api'; 

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const onFinish = async (values: any) => {
    console.log('Received values of form: ', values);
    try {
      const response = await apiClient.post('/v1/auth/login', {
        username: values.username,
        password: values.password,
      });

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem(
          'user',
          JSON.stringify({
            userId: data.userId,
            username: data.username,
            role: data.role
          })
        );

        message.success('Đăng nhập thành công!');

        if (data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          // Chuyển hướng người dùng trở lại trang họ đang cố gắng truy cập
          navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
      } else {
        message.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Đăng nhập
        </Title>
        <Form name="login" onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
