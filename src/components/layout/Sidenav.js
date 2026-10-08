import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { LineChartOutlined, FormOutlined, LockOutlined } from "@ant-design/icons";
import { lock } from "../../useAccount";
import logo from "../../assets/images/logo.png";

function Sidenav() {
  const { pathname } = useLocation();
  return (
    <>
      <div className="brand">
        <img src={logo} alt="" />
        <span>Trading Dashboard</span>
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[pathname]}>
        <Menu.Item key="/dashboard" icon={<LineChartOutlined />}>
          <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="/data-entry" icon={<FormOutlined />}>
          <Link to="/data-entry">Data Entry</Link>
        </Menu.Item>
        <Menu.Item key="lock" icon={<LockOutlined />} onClick={lock}>
          Lock
        </Menu.Item>
      </Menu>
    </>
  );
}

export default Sidenav;
