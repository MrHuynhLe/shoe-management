import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import HeaderBar from './components/HeaderBar'
import FooterBar from './components/FooterBar'

const { Content } = Layout

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <HeaderBar />

      <Content style={{ padding: '24px 64px', flex: 1 }}>
        <Outlet />
      </Content>

      <FooterBar />
    </Layout>
  )
}

export default MainLayout
