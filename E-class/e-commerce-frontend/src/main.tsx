import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";

import "antd/dist/reset.css";
import "./styles/global.css";

import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider locale={viVN}>
      <App />
    </ConfigProvider>
  </StrictMode>
);