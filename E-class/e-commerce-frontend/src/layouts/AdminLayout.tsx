import ProLayout, { PageContainer } from "@ant-design/pro-layout";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  TagsOutlined,
} from "@ant-design/icons";
import { Dropdown, Space, Avatar, Badge, ConfigProvider } from "antd";
import antdViVN from "antd/locale/vi_VN";
import proViVN from "@ant-design/pro-provider/es/locale/vi_VN";

import ChatbotWidget from "@/features/chatbot/ChatbotWidget";
import { useAuth } from "@/services/AuthContext";

import logo from "@/assets/logo-shoe-shop.png";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <ConfigProvider
      locale={{ ...antdViVN, ...proViVN }}
      theme={{
        token: {
          colorPrimary: "#1b6eea",
          colorBgLayout: "#f7f9fb",
          colorBgContainer: "#ffffff",
          colorText: "#1f2937",
          colorTextSecondary: "#6b7280",
          colorBorder: "#e5e7eb",
          borderRadius: 10,
          borderRadiusSM: 8,
          controlHeight: 44,
          controlHeightLG: 48,
          boxShadow: "0 4px 10px rgba(15, 23, 42, 0.08)",
        },
      }}
    >
      <>
        <ProLayout
          style={{ minHeight: "100vh", backgroundColor: "#f7f9fb" }}
          title="S-Shop Admin"
          logo={logo}
          layout="mix"
          navTheme="light"
          splitMenus={false}
          token={{
            sider: {
              colorBgMenuItemHover: "rgba(27, 110, 234, 0.08)",
              colorTextMenuActive: "#1b6eea",
              colorTextMenu: "#374151",
              colorBgMenuItemActive: "#ffffff",
            },
            pageContainer: {
              paddingInlinePageContainerContent: 24,
              paddingBlockPageContainerContent: 24,
            },
          }}
          location={location}
          menuDataRender={() => [
            {
              key: "/admin",
              path: "/admin",
              name: "Dashboard & Thống kê",
              icon: <DashboardOutlined />,
            },
            {
              key: "/admin/users",
              path: "/admin/users",
              name: "Tài khoản hệ thống",
              icon: <UserOutlined />,
            },
            {
              key: "pos",
              path: "/admin/pos",
              name: "Bán hàng (POS)",
              icon: <ShopOutlined />,
            },
            {
              key: "product-management",
              name: "Quản lý sản phẩm",
              icon: <AppstoreOutlined />,
              children: [
                {
                  key: "/admin/products",
                  path: "/admin/products",
                  name: "Sản phẩm",
                },
                {
                  key: "/admin/brands",
                  path: "/admin/brands",
                  name: "Thương hiệu",
                },
                {
                  key: "/admin/categories",
                  path: "/admin/categories",
                  name: "Danh mục",
                },
                {
                  key: "/admin/attributes/colors",
                  path: "/admin/attributes/colors",
                  name: "Màu sắc",
                },
                {
                  key: "/admin/attributes/sizes",
                  path: "/admin/attributes/sizes",
                  name: "Kích cỡ",
                },
                {
                  key: "/admin/attributes/materials",
                  path: "/admin/attributes/materials",
                  name: "Chất liệu",
                },
                {
                  key: "/admin/product-images",
                  path: "/admin/product-images",
                  name: "Hình ảnh",
                },
              ],
            },
            {
              key: "/admin/orders",
              path: "/admin/orders",
              name: "Quản lý hoá đơn",
              icon: <SolutionOutlined />,
            },
            {
              key: "/admin/employees",
              path: "/admin/employees",
              name: "Quản lý nhân viên",
              icon: <TeamOutlined />,
            },
            {
              key: "/admin/customers",
              path: "/admin/customers",
              name: "Quản lý khách hàng",
              icon: <UserOutlined />,
            },
            {
              key: "/admin/discounts",
              name: "Khuyến mãi",
              icon: <TagsOutlined />,
              children: [
                {
                  key: "/admin/discounts/coupons",
                  path: "/admin/discounts/coupons",
                  name: "Mã giảm giá (Coupon)",
                },
              ],
            },
          ]}
          menuItemRender={(menuItemProps, defaultDom) => {
            if (menuItemProps.isUrl || !menuItemProps.path) {
              return defaultDom;
            }
            return <Link to={menuItemProps.path}>{defaultDom}</Link>;
          }}
          actionsRender={() => [
            <Space size="middle" key="admin-actions">
              <Badge count={5} size="small">
                <BellOutlined style={{ fontSize: 18 }} />
              </Badge>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                key="user-menu"
              >
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

        <ChatbotWidget channel="ADMIN" />
      </>
    </ConfigProvider>
  );
};

export default AdminLayout;