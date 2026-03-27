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
          borderRadius: 10,
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          colorText: 'rgba(0, 0, 0, 0.85)',
          colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
          controlPaddingHorizontal: 16,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
          colorBgBase: '#f4f5f7',
          colorBgContainer: '#ffffff',
        },
        components: {
          Button: {
            borderRadius: 8,
            colorPrimaryHover: '#1662d6',
          },
          Card: {
            borderRadius: 12,
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
          },
          Layout: {
            colorBgHeader: '#ffffff',
            colorBgBody: '#f4f5f7',
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
