import { Layout, Badge, Menu } from 'antd'
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
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
        padding: '0 24px',
      }}
    >
      {/* Logo */}
      <div style={{ fontSize: 24, fontWeight: 700, color: '#00b96b' }}>
        S-Shop Online
      </div>

      {/* Menu */}
      <Menu
        mode="horizontal"
        style={{ flex: 1, borderBottom: 'none', justifyContent: 'center' }}
        items={[
          { key: 'nike', label: 'NIKE' },
          { key: 'adidas', label: 'ADIDAS' },
          { key: 'jordan', label: 'JORDAN' },
          { key: 'yeezy', label: 'YEEZY' },
          { key: 'other', label: 'OTHER BRANDS' },
          { key: 'sale', label: 'SALE' },
        ]}
      />

      {/* Icons */}
      <div style={{ display: 'flex', gap: 20, fontSize: 18, alignItems: 'center' }}>
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
