import { Badge, Layout, Menu, Space, Input, Dropdown, Row, Col } from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo-shoe-shop.png';

const { Header } = Layout;

const CustomHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      console.log('Đăng xuất');
    }
  };
  const userMenuItems = [
    {
      key: 'profile',
      label: <Link to="/account">Quản lý thông tin cá nhân</Link>,
    },
    { key: 'logout', label: 'Đăng xuất' },
  ];

  return (
    <Header
      style={{ background: '#fff', padding: '0 48px', borderBottom: '1px solid #f0f0f0' }}
    >
      <Row align="middle" style={{ height: '100%' }}>
        <Col flex={1}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logo} alt="S-Shop Logo" style={{ height: '40px' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'rgba(0, 0, 0, 0.88)' }}>
              S-Shop Online
            </h1>
          </Link>
        </Col>
        <Col flex={1}>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            style={{
              borderBottom: 'none',
              lineHeight: '62px',
              display: 'flex', justifyContent: 'center'
            }}
            items={[
              { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
              { key: '/products', label: 'Sản phẩm' },
            ]}
          />
        </Col>
        <Col flex={1} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Space size={24} align="center">
            <Input.Search placeholder="Tìm kiếm..." style={{ width: 200, paddingTop: '16px' }} />
            <Link to="/cart">
              <Badge count={3} size="small">
                <ShoppingCartOutlined style={{ fontSize: 22, color: 'rgba(0, 0, 0, 0.88)' }} />
              </Badge>
            </Link>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <a onClick={(e) => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'inherit' }}>
                <UserOutlined style={{ fontSize: 22, color: 'rgba(0, 0, 0, 0.88)' }} />
              </a>
            </Dropdown>
          </Space>
        </Col>
      </Row>
    </Header>
  );
};

export default CustomHeader;