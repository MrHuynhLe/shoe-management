import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { Link, Outlet, useLocation } from 'react-router-dom';
import FooterBar from './components/FooterBar';
import CustomHeader from './components/CustomHeader';
import { ConfigProvider } from 'antd'; 
import antdViVN from 'antd/locale/vi_VN'; 
import proViVN from '@ant-design/pro-provider/es/locale/vi_VN'; 

const MainLayout = () => {
  const location = useLocation();

  return (
    <ConfigProvider locale={{ ...antdViVN, ...proViVN }}>
      <ProLayout
        style={{ minHeight: '100vh' }}      
        layout="top"
        contentWidth="Fluid"
        location={location}
        headerRender={() => <CustomHeader />}
        footerRender={() => <FooterBar />}
      >
        <PageContainer>
          <Outlet />
        </PageContainer>
      </ProLayout>
    </ConfigProvider>
  );
};

export default MainLayout;