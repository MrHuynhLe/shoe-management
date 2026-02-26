import { Badge, Layout, Menu, Space, Input, Dropdown, Row, Col, ConfigProvider } from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  UserOutlined,
  PhoneOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '@/assets/logo-shoe-shop.png';

const { Header } = Layout;

const CustomHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate(`/products?keyword=${encodeURIComponent(trimmed)}`);
      setSearchValue('');
    }
  };

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
      style={{
        background: '#ffffff',
        padding: '0 48px',
        borderBottom: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <Row align="middle" style={{ height: '100%' }}>
        <Col flex={1}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logo} alt="S-Shop Logo" style={{ height: '40px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#1a1a2e' }}>
              S-Shop Online
            </h1>
          </Link>
        </Col>
        <Col flex={1}>
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemSelectedColor: '#1a1a2e',
                  itemSelectedBg: 'transparent',
                  itemHoverBg: 'rgba(0,82,217,0.06)',
                  itemHoverColor: '#0052D9',
                },
              },
            }}
          >
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              onClick={({ key }) => navigate(key)}
              style={{
                background: 'transparent',
                borderBottom: 'none',
                lineHeight: '62px',
                display: 'flex',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 500,
              }}
              items={[
                { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
                { key: '/products', label: 'Sản phẩm', icon: <AppstoreOutlined /> },
                { key: '/contact', label: 'Liên hệ', icon: <PhoneOutlined /> },
              ]}
            />
          </ConfigProvider>
        </Col>
        <Col flex={1} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Space size={24} align="center">
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              style={{
                width: 280,
                height: 40,
                borderRadius: 24,
                background: '#f5f5f7',
                border: 'none',
                fontSize: 14,
              }}
            />
            <Link
              to="/my-orders"
              style={{ color: '#1a1a2e', display: 'inline-block', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.color = '#0052D9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.color = '#1a1a2e';
              }}
            >
              <SolutionOutlined style={{ fontSize: 24 }} />
            </Link>
            <Link
              to="/cart"
              style={{ color: '#1a1a2e', display: 'inline-block', transition: 'transform 0.2s, color 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.color = '#0052D9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.color = '#1a1a2e';
              }}
            >
              <Badge count={3} size="small">
                <ShoppingCartOutlined style={{ fontSize: 24 }} />
              </Badge>
            </Link>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <a
                onClick={(e) => e.preventDefault()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#1a1a2e',
                  transition: 'transform 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.color = '#0052D9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.color = '#1a1a2e';
                }}
              >
                <UserOutlined style={{ fontSize: 24 }} />
              </a>
            </Dropdown>
          </Space>
        </Col>
      </Row>
    </Header>
  );
};

export default CustomHeader;
