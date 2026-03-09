import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { App as AntdApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './styles/global.css'
import { AuthProvider } from './services/AuthContext'

createRoot(document.getElementById('root')!).render(
 <StrictMode>
    <ConfigProvider>
      <AuthProvider>
        <AntdApp>
          <App />
        </AntdApp>
      </AuthProvider>
    </ConfigProvider>
  </StrictMode>
)
