import { Layout, Menu, Badge } from 'antd'
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons'

const { Header } = Layout

const HeaderBar = () => {
  return (
    <Header
      style={{
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px'
      }}
    >
      {/* Logo */}
      <div style={{ fontSize: 24, fontWeight: 700, color: '#00b96b' }}>
        S-Shop Online
      </div>

      {/* Menu */}
      <Menu
        mode="horizontal"
        style={{ flex: 1, marginLeft: 40 }}
        items={[
          { key: 'intro', label: 'GIỚI THIỆU' },
          { key: 'nike', label: 'NIKE' },
          { key: 'adidas', label: 'ADIDAS' },
          { key: 'jordan', label: 'JORDAN' },
          { key: 'yeezy', label: 'YEEZY' },
          { key: 'other', label: 'OTHER BRANDS' },
          { key: 'sale', label: 'SALE' },
          { key: 'lace', label: 'DÂY GIÀY' }
        ]}
      />

      {/* Icons */}
      <div style={{ display: 'flex', gap: 20, fontSize: 18 }}>
        <SearchOutlined />
        <UserOutlined />
        <Badge count={3}>
          <ShoppingCartOutlined />
        </Badge>
      </div>
    </Header>
  )
}

export default HeaderBar
