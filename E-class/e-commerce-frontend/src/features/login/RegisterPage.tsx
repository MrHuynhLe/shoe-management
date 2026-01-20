import { Card } from 'antd';
import RegisterForm from './RegisterForm';

const RegisterPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 400 }}>
        <RegisterForm />
      </Card>
    </div>
  );
};

export default RegisterPage;