import { Layout, ConfigProvider } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import CustomHeader from './components/CustomHeader';
import FooterBar from './components/FooterBar';

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', minWidth: '1200px' }}>
      <CustomHeader />
      <Content style={{ flex: '1 0 auto', padding: '24px 48px', background: '#F0F8FF' }}>
        <ConfigProvider
          theme={{
            components: {
              Typography: {
                titleMarginBottom: '0.5em',
                titleMarginTop: '1em',
                fontWeightStrong: 600,
              },
            },
          }}
        >
          <div style={{ background: '#fff', padding: 24, minHeight: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Outlet />
          </div>
        </ConfigProvider>
      </Content>
      <FooterBar />
    </Layout>
  );
};

export default MainLayout;