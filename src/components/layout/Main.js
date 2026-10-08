import { Layout } from "antd";
import Sidenav from "./Sidenav";

function Main({ children }) {
  return (
    <Layout className="app-layout">
      <Layout.Sider breakpoint="lg" collapsedWidth="0" trigger={null} width={240} className="app-sider">
        <Sidenav />
      </Layout.Sider>
      <Layout.Content>{children}</Layout.Content>
    </Layout>
  );
}

export default Main;
