import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Drawer, Layout } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import Sidenav from "./Sidenav";

// Desktop: fixed sidebar. Mobile (<992px, switched in CSS): top bar + slide-in drawer.
function Main({ children }) {
  const [open, setOpen] = useState(false);
  const { asPath } = useRouter();
  useEffect(() => setOpen(false), [asPath]); // close the drawer after navigating

  return (
    <Layout className="app-layout">
      <Layout.Sider trigger={null} width={240} className="app-sider">
        <Sidenav />
      </Layout.Sider>
      <Layout>
        <div className="mobile-bar">
          <Button type="text" icon={<MenuOutlined />} onClick={() => setOpen(true)} aria-label="Open menu" />
          <span>Trading Dashboard</span>
        </div>
        <Layout.Content>{children}</Layout.Content>
      </Layout>
      <Drawer placement="left" width={260} closable={false} open={open} onClose={() => setOpen(false)} className="app-drawer" bodyStyle={{ padding: 0 }}>
        <div className="app-sider"><Sidenav /></div>
      </Drawer>
    </Layout>
  );
}

export default Main;
