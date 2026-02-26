import { Layout, ConfigProvider } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import CustomHeader from './components/CustomHeader';
import FooterBar from './components/FooterBar';

const { Content } = Layout;

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', minWidth: '1200px' }}>
      <CustomHeader />
      <Content style={{ flex: '1 0 auto', background: '#f5f5f7' }}>
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
          {isHomePage ? (
            <Outlet />
          ) : (
            <div style={{ padding: '24px 48px' }}>
              <div
                style={{
                  background: '#fff',
                  padding: 32,
                  minHeight: '100%',
                  borderRadius: 12,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                }}
              >
                <Outlet />
              </div>
            </div>
          )}
        </ConfigProvider>
      </Content>
      <FooterBar />
    </Layout>
  );
};

export default MainLayout;
