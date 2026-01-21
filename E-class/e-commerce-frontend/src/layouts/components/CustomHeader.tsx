import { Badge, Layout, Menu, Space, Input, Dropdown } from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
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
      // Xử lý logic đăng xuất ở đây
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
        background: '#fff',
        padding: '0 24px',
        height: 'auto',
        lineHeight: 'initial',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={logo} alt="S-Shop Logo" style={{ height: '40px' }} />
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            S-Shop Online
          </h1>
        </div>
        <div key="actions">
          <Space size="large">
            <Input.Search placeholder="Tìm kiếm sản phẩm..." style={{ width: 200 }} />
            <Link to="/cart">
              <Badge count={3}>
                <ShoppingCartOutlined style={{ fontSize: 18, color: 'rgba(0, 0, 0, 0.88)' }} />
              </Badge>
            </Link>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <UserOutlined style={{ fontSize: 18, color: 'rgba(0, 0, 0, 0.88)' }} />
                </Space>
              </a>
            </Dropdown>
          </Space>
        </div>
      </div>

      <Menu
        className="custom-main-menu"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        style={{
          borderBottom: 'none',
          lineHeight: '46px',
          backgroundColor: 'transparent',
          justifyContent: 'center', 
        }}
        items={[
          { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
          { key: '/products', label: 'Sản phẩm', icon: <ShoppingCartOutlined /> },
        ]}
      />
    </Header>
  );
};

export default CustomHeader;