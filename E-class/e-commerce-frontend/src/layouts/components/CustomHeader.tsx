import {
  AppstoreOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Col,
  ConfigProvider,
  Dropdown,
  Input,
  Layout,
  Menu,
  Popconfirm,
  Row,
  Space,
  message,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo-shoe-shop.png";
import { useAuth } from "@/services/AuthContext";

const { Header } = Layout;

const CustomHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, orderCount } = useAuth();

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      logout();
      message.success("Đăng xuất thành công");
      navigate("/");
    }
  };

  const userMenuItems = isAuthenticated
    ? [
        {
          key: "profile",
          label: <Link to="/profile">Thông tin cá nhân</Link>,
        },
        {
          key: "logout",
          label: (
            <Popconfirm
              title="Bạn có chắc chắn muốn đăng xuất?"
              onConfirm={() => handleUserMenuClick({ key: "logout" })}
              okText="Đồng ý"
              cancelText="Không"
            >
              <span style={{ display: "block", width: "100%" }}>Đăng xuất</span>
            </Popconfirm>
          ),
        },
      ]
    : [
        {
          key: "login",
          label: <Link to="/account">Đăng nhập / Đăng ký</Link>,
        },
      ];

  return (
    <Header className="app-header">
      <Row align="middle" gutter={[16, 12]} style={{ minHeight: 72 }}>
        <Col xs={24} lg={7}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={logo}
              alt="S-Shop Logo"
              style={{ height: 44, width: 44, objectFit: "contain" }}
            />
            <h1
              style={{
                margin: 0,
                color: "#172033",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 0,
              }}
            >
              S-Shop Online
            </h1>
          </Link>
        </Col>

        <Col xs={24} lg={7}>
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemHoverBg: "rgba(27, 110, 234, 0.08)",
                  itemHoverColor: "#1b6eea",
                  itemSelectedBg: "transparent",
                  itemSelectedColor: "#1b6eea",
                },
              },
            }}
          >
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              onClick={({ key }) => navigate(key)}
              style={{
                background: "transparent",
                borderBottom: "none",
                display: "flex",
                fontSize: 16,
                fontWeight: 650,
                justifyContent: "center",
                lineHeight: "48px",
              }}
              items={[
                { key: "/", label: "Trang chủ", icon: <HomeOutlined /> },
                {
                  key: "/products",
                  label: "Sản phẩm",
                  icon: <AppstoreOutlined />,
                },
              ]}
            />
          </ConfigProvider>
        </Col>

        <Col
          xs={24}
          lg={10}
          style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
        >
          <Space size={12} align="center" wrap>
            <Input.Search placeholder="Tìm kiếm sản phẩm..." style={{ width: 280 }} />

            <Link to="/cart" style={{ color: "#1b6eea", display: "inline-flex" }}>
              <Badge count={orderCount} size="small">
                <Button shape="circle" icon={<ShoppingCartOutlined />} />
              </Badge>
            </Link>

            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) =>
                  key !== "logout" && handleUserMenuClick({ key }),
              }}
              placement="bottomRight"
            >
              <a
                onClick={(e) => e.preventDefault()}
                style={{
                  alignItems: "center",
                  color: "#1b6eea",
                  display: "flex",
                  gap: 8,
                }}
              >
                {isAuthenticated && user ? (
                  <Avatar style={{ backgroundColor: "#1b6eea" }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <Button shape="circle" icon={<UserOutlined />} />
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
