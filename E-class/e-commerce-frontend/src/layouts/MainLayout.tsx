import { Layout, ConfigProvider } from 'antd';
import { Outlet } from 'react-router-dom';
import CustomHeader from './components/CustomHeader';
import FooterBar from './components/FooterBar';
import ChatbotWidget from "@/features/chatbot/ChatbotWidget";

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout className="app-shell" style={{ display: 'flex', flexDirection: 'column' }}>
      <CustomHeader />
      <Content className="app-content">
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
          <div className="app-page">
            <Outlet />
          </div>
        </ConfigProvider>
     </Content>
      <ChatbotWidget channel="WEB_USER" />
      <FooterBar />
    </Layout>
  );
};

export default MainLayout;
