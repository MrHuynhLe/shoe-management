import { Badge, Layout, Menu, Space, Input, Dropdown, Row, Col, ConfigProvider, message, Avatar } from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/services/useAuth';
import logo from '@/assets/logo-shoe-shop.png';

const { Header } = Layout;

const CustomHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      message.success('Đăng xuất thành công!');
      window.location.href = '/';
    }
  };

  const userMenuItems = isAuthenticated ? [
    {
      key: 'profile',
      label: <Link to="/account">Quản lý thông tin cá nhân</Link>,
    },
    { key: 'logout', label: 'Đăng xuất' },
  ] : [
    {
      key: 'login',
      label: <Link to="/account">Đăng nhập / Đăng ký</Link>,
    }
  ];

  return (
    <Header
      style={{ background: '#E6F0FF', padding: '0 48px' }} 
    >
      <Row align="middle" style={{ height: '100%' }}>
        <Col flex={1}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logo} alt="S-Shop Logo" style={{ height: '40px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 'bolder', margin: 0, color: '#0040A8' }}>
              S-Shop Online
            </h1>
          </Link>
        </Col>
        <Col flex={1}>
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemSelectedColor: '#0052D9', 
                  itemSelectedBg: 'transparent', 
                  itemHoverBg: '#D6E4FF',
                  itemHoverColor: '#0052D9', 
                },
              },
            }}
          >
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]} 
              onClick={({ key }) => navigate(key)}
              style={{ background: 'transparent', borderBottom: 'none', lineHeight: '62px', display: 'flex', justifyContent: 'center', fontSize: '18px', fontWeight: 500 }}
              items={[
                { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
                { key: '/products', label: 'Sản phẩm', icon: <AppstoreOutlined /> },
              ]}
            />
          </ConfigProvider>
        </Col>
        <Col flex={1} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Space size={24} align="center">
            <Input.Search placeholder="Tìm kiếm..." style={{ width: 300, paddingTop: '16px', color: '#0052D9' }} />
            <Link to="/cart" style={{ color: '#0052D9', display: 'inline-block', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Badge count={3} size="small">
                <ShoppingCartOutlined style={{ fontSize: 24 }} />
              </Badge>
            </Link>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <a
                onClick={(e) => e.preventDefault()}
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0052D9', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isAuthenticated && user ? (
                  <Avatar style={{ backgroundColor: '#0052D9' }}>{user.username.charAt(0).toUpperCase()}</Avatar>
                ) : (
                  <UserOutlined style={{ fontSize: 24 }} />
                )}
              </a>
            </Dropdown>
          </Space>
        </Col>
      </Row>
    </Header>
  );
};

export default CustomHeader;