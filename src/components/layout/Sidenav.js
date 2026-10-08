import { Menu } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { LineChartOutlined, FormOutlined } from "@ant-design/icons";
import logo from "../../assets/images/logo.png";

function Sidenav() {
  const { pathname } = useRouter();
  return (
    <>
      <div className="brand">
        <img src={logo.src} alt="" />
        <span>Trading Dashboard</span>
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[pathname]}>
        <Menu.Item key="/dashboard" icon={<LineChartOutlined />}>
          <Link href="/dashboard">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="/data-entry" icon={<FormOutlined />}>
          <Link href="/data-entry">Data Entry</Link>
        </Menu.Item>
      </Menu>
    </>
  );
}

export default Sidenav;
