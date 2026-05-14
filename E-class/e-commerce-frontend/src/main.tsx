import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { App as AntdApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './styles/global.css'
import { AuthProvider } from './services/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1b6eea',
          colorSuccess: '#16a34a',
          colorWarning: '#d97706',
          colorError: '#dc2626',
          borderRadius: 10,
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          colorText: '#172033',
          colorTextSecondary: '#667085',
          colorBorder: '#e5eaf3',
          colorBorderSecondary: '#edf1f7',
          controlPaddingHorizontal: 16,
          boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
          boxShadowSecondary: '0 4px 16px rgba(15, 23, 42, 0.06)',
          colorBgBase: '#f3f6fb',
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f3f6fb',
        },
        components: {
          Button: {
            borderRadius: 8,
            colorPrimaryHover: '#1662d6',
            controlHeight: 40,
          },
          Card: {
            borderRadius: 10,
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
          },
          Layout: {
            colorBgHeader: '#ffffff',
            colorBgBody: '#f3f6fb',
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#344054',
            rowHoverBg: '#f7fbff',
          },
          Menu: {
            itemBorderRadius: 8,
            itemSelectedColor: '#1b6eea',
            itemSelectedBg: 'rgba(27, 110, 234, 0.1)',
          },
        },
      }}
    >
      <AuthProvider>
        <AntdApp>
          <App />
        </AntdApp>
      </AuthProvider>
    </ConfigProvider>
  </StrictMode>
)
