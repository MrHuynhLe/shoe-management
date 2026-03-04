import { Card, Tabs } from 'antd';
import LoginForm from './Login';
import RegisterForm from './RegisterForm';
import { useAuth } from '@/services/useAuth';
const AccountPage = () => {
  const { isAuthenticated } = useAuth();


  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 400 }}>
        <Tabs
          defaultActiveKey="login"
          items={[
            {
              label: 'Đăng nhập',
              key: 'login',
              children: <LoginForm />,
            },
            {
              label: 'Đăng ký',
              key: 'register',
              children: <RegisterForm />,
            },
          ]}
        />
      </Card>
    </div>
  );
};
export default AccountPage;