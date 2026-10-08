import { useState } from "react";
import { Alert, Button, Card, Col, Row, Select, Spin } from "antd";
import { CheckOutlined, ReloadOutlined } from "@ant-design/icons";
import Link from "next/link";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useAccount } from "../useAccount";

const money = (n) =>
  (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Bar({ percent, color, label }) {
  const on = Math.round((percent / 100) * 30);
  return (
    <div className="segbar">
      <div className="segs">
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i} style={i < on ? { background: color } : undefined} />
        ))}
      </div>
      {label && <span style={{ color, minWidth: 52, textAlign: "right" }}>{label}</span>}
    </div>
  );
}

function Objective({ title, value, children, result }) {
  return (
    <Col xs={24} sm={12} xl={6}>
      <Card bordered={false} className="hoverable" style={{ height: "100%" }}>
        <div className="label">{title}</div>
        <div className="kpi">{value}</div>
        {children}
        <div className="label" style={{ marginTop: 14 }}>{result}</div>
      </Card>
    </Col>
  );
}

export default function Home() {
  const [range, setRange] = useState("7");
  const { loading, error, settings: account, derived: d, reload } = useAccount();

  if (loading) return <Spin style={{ display: "block", margin: "120px auto" }} />;
  if (error || !account)
    return (
      <div className="page">
        <Alert
          type={error ? "error" : "info"}
          showIcon
          message={error || "No account set up yet."}
          description={<Link href="/data-entry">Go to Data Entry to add your account rules and daily equity.</Link>}
        />
      </div>
    );

  const clamp = (v) => Math.max(0, Math.min(100, v));
  const targetPct = clamp((d.pnl / account.profitTarget) * 100);
  const dailyUsedPct = clamp((d.dailyLossUsed / account.dailyLossLimit) * 100);
  const maxUsedPct = clamp(((account.initialBalance - d.equity) / account.maxLossLimit) * 100);

  const chart = {
    options: {
      theme: { mode: "dark" },
      chart: { toolbar: { show: false }, zoom: { enabled: false }, background: "transparent", fontFamily: "inherit" },
      stroke: { curve: "smooth", width: 3 },
      dataLabels: { enabled: false },
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02 } },
      xaxis: { type: "category", axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { formatter: (v) => v.toFixed(0) } },
      grid: { borderColor: "#232838", strokeDashArray: 4 },
      tooltip: { theme: "dark" },
      colors: ["#1890ff"],
    },
    series: [{ name: "Equity", data: d.curve.slice(-Number(range)) }],
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Overview</h1>
          <p>Trading objectives and account status</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={reload}>Refresh</Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={17}>
          <Row gutter={[16, 16]} align="stretch">
            <Objective title="Profit target" value={money(account.profitTarget)} result={<>Result: <b>{money(d.pnl)}</b></>}>
              <Bar percent={targetPct} color="#3ddc84" label={`${targetPct.toFixed(2)}%`} />
            </Objective>

            <Objective title="Min trading days" value={`${account.minDays} Days`} result={<>Result: <b>{d.tradedDays} Days</b></>}>
              <div className="pills">
                {Array.from({ length: account.minDays }, (_, i) => (
                  <span key={i} className={i < d.tradedDays ? "on" : ""}>{i < d.tradedDays && <CheckOutlined />}</span>
                ))}
              </div>
            </Objective>

            <Objective title="Daily loss limit" value={money(account.dailyLossLimit)} result={<>Remaining: <b>{money(account.dailyLossLimit - d.dailyLossUsed)}</b></>}>
              <Bar percent={dailyUsedPct} color="#ff6b6b" />
            </Objective>

            <Objective title="Max loss limit" value={money(account.maxLossLimit)} result={<>Remaining: <b>{money(d.maxLossRemaining)}</b></>}>
              <Bar percent={maxUsedPct} color="#ff6b6b" />
            </Objective>
          </Row>

          <Card
            bordered={false}
            style={{ marginTop: 24 }}
            title="Account Status"
            extra={
              <Select value={range} onChange={setRange} style={{ width: 110 }}>
                <Select.Option value="7">7 Days</Select.Option>
                <Select.Option value="14">14 Days</Select.Option>
                <Select.Option value="30">30 Days</Select.Option>
              </Select>
            }
          >
            <ReactApexChart options={chart.options} series={chart.series} type="area" height={300} />
          </Card>
        </Col>

        <Col xs={24} xl={7}>
          <Card bordered={false}>
            <div className="balance-box">
              <div className="label">Current balance</div>
              <div className="kpi">{money(d.equity)}</div>
            </div>
            <div className="stat-row"><span className="label">Initial balance</span><b>{money(account.initialBalance)}</b></div>
            <div className="stat-row"><span className="label">Capital (closed)</span><b>{money(d.capital)}</b></div>
            <div className="stat-row"><span className="label">Equity</span><b>{money(d.equity)}</b></div>
            <div className="stat-row"><span className="label">Floating P/L</span><b className={d.floating >= 0 ? "pos" : "neg"}>{money(d.floating)}</b></div>
            <div className="stat-row"><span className="label">Return on capital</span><b className={d.returnPct >= 0 ? "pos" : "neg"}>{d.returnPct.toFixed(2)}%</b></div>
            <div className="stat-row"><span className="label">Profit/Loss</span><b className={d.pnl >= 0 ? "pos" : "neg"}>{money(d.pnl)}</b></div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

