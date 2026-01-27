import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { App as AntdApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
 <StrictMode>
    <ConfigProvider>
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  </StrictMode>
)
