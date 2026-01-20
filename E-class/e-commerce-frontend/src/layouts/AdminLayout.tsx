import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  TeamOutlined,
  ShopOutlined,
  SolutionOutlined,
  LineChartOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Dropdown, Space, Avatar, Badge } from 'antd';
import logo from '@/assets/logo-shoe-shop.png';


const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xử lý logic đăng xuất (xóa token, session, etc.)
    console.log('Admin logging out');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <ProLayout
      style={{ minHeight: '100vh' }}
      title="S-Shop Admin"
      logo={logo}
      layout="mix"
      token={{
        sider: {
          colorBgMenuItemHover: 'rgba(0,0,0,0.08)',
        },
      }}
      location={location}
      menuDataRender={() => [
        {
          path: '/admin',
          name: 'Dashboard',
          icon: <DashboardOutlined />,
        },
        {
          path: '/admin/users',
          name: 'Quản lý người dùng',
          icon: <UserOutlined />,
        },
        {
          name: 'Quản lý bán hàng',
          icon: <ShopOutlined />,
          children: [
            {
              path: '/admin/products',
              name: 'Quản lý sản phẩm',
            },
            {
              path: '/admin/inventory',
              name: 'Quản lý kho hàng',
            },
            {
              path: '/admin/orders',
              name: 'Quản lý hoá đơn',
            },
          ],
        },
        {
          path: '/admin/employees',
          name: 'Quản lý nhân viên',
          icon: <TeamOutlined />,
        },
        {
          path: '/admin/customers',
          name: 'Quản lý khách hàng',
          icon: <UserOutlined />,
        },
        {
          path: '/admin/revenue',
          name: 'Thống kê doanh thu',
          icon: <LineChartOutlined />,
        },
      ]}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || !menuItemProps.path) {
          return defaultDom;
        }
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      actionsRender={() => [
        <Space size="middle">
          <Badge count={5} size="small">
            <BellOutlined style={{ fontSize: 18 }} />
          </Badge>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" key="user-menu">
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>Admin</span>
              </Space>
            </a>
          </Dropdown>
        </Space>,
      ]}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </ProLayout>
  );
};

export default AdminLayout;