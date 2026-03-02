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
import { Dropdown, Space, Avatar, Badge, ConfigProvider } from 'antd';
import antdViVN from 'antd/locale/vi_VN'; 
import proViVN from '@ant-design/pro-provider/es/locale/vi_VN'; 

import logo from '@/assets/logo-shoe-shop.png';


const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
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
    <ConfigProvider locale={{ ...antdViVN, ...proViVN }}>
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
            key: '/admin',
            path: '/admin',
            name: 'Dashboard',
            icon: <DashboardOutlined />,
          },
          {
            key: '/admin/users',
            path: '/admin/users',
            name: 'Tài khoản hệ thống',
            icon: <UserOutlined />,
          },
          {
            key: 'pos',
            name: 'Bán hàng (POS)',
            icon: <ShopOutlined />,
            children: [
              {
                key: '/admin/products',
                path: '/admin/products',
                name: 'Quản lý sản phẩm',
              },
              {
                key: '/admin/orders',
                path: '/admin/orders',
                name: 'Quản lý hoá đơn',
              },
            ],
          },
          {
            key: 'warehouse',
            name: 'Kho hàng',
            icon: <ShopOutlined />,
            children: [
              {
                key: '/admin/inventory',
                path: '/admin/inventory',
                name: 'Tồn kho',
              },
              {
                key: '/admin/warehouse/receipts',
                path: '/admin/warehouse/receipts',
                name: 'Phiếu nhập',
              },
              {
                key: '/admin/warehouse/issues',
                path: '/admin/warehouse/issues',
                name: 'Phiếu xuất',
              },
            ],
          },
          {
            key: '/admin/employees',
            path: '/admin/employees',
            name: 'Quản lý nhân viên',
            icon: <TeamOutlined />,
          },
          {
            key: '/admin/customers',
            path: '/admin/customers',
            name: 'Quản lý khách hàng',
            icon: <UserOutlined />,
          },
          {
            key: '/admin/revenue',
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
    </ConfigProvider>
  );
};

export default AdminLayout;