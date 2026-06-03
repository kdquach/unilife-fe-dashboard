import React from "react";
import { ConfigProvider } from "antd";
import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./features/auth/AuthContext";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF4A2B",
          borderRadius: 14,
          fontFamily: "Inter, system-ui, sans-serif",
        },
        components: {
          Layout: {
            headerBg: "#FFFFFF",
            siderBg: "#FFFFFF",
          },
          Card: {
            borderRadiusLG: 20,
          },
          Button: {
            controlHeightLG: 46,
          },
        },
      }}
    >
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ConfigProvider>
  );
}
