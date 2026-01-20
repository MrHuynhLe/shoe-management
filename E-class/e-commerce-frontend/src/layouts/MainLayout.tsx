import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { Link, Outlet, useLocation } from 'react-router-dom';
import FooterBar from './components/FooterBar';
import CustomHeader from './components/CustomHeader';

const MainLayout = () => {
  const location = useLocation();

  return (
    <ProLayout
      style={{ minHeight: '100vh' }}      
      layout="top"
      contentWidth="Fluid"
      location={location}
      headerRender={() => <CustomHeader />}
      menuDataRender={() => []} 
      footerRender={() => <FooterBar />}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </ProLayout>
  );
};

export default MainLayout;