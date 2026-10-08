import { useEffect } from "react";
import { Alert, Button, Card, Col, Form, InputNumber, DatePicker, Popconfirm, Row, Table, Typography, message } from "antd";
import moment from "moment";
import { api, useAccount } from "../useAccount";

const { Title } = Typography;
const settingFields = [
  ["initialBalance", "Initial balance ($)"],
  ["profitTarget", "Profit target ($)"],
  ["minDays", "Min trading days"],
  ["dailyLossLimit", "Daily loss limit ($)"],
  ["maxLossLimit", "Max loss limit ($)"],
];

// Capital falls back to equity for entries saved before the field existed; Day P/L = capital change vs the previous entry.
const withPnl = (entries) =>
  entries.map((e, i) => {
    const capital = e.capital ?? e.equity;
    const prev = i ? entries[i - 1].capital ?? entries[i - 1].equity : null;
    return { ...e, capital, pnl: prev == null ? 0 : capital - prev };
  });

export default function DataEntry() {
  const { loading, error, settings, entries, reload } = useAccount();
  const [settingsForm] = Form.useForm();

  useEffect(() => {
    if (settings) settingsForm.setFieldsValue(settings);
  }, [settings, settingsForm]);

  const run = (fn, ok) => async (values) => {
    try {
      await fn(values);
      message.success(ok);
      reload();
    } catch (e) {
      message.error(e.message);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Data Entry</h1>
          <p>Set your account rules and log daily equity. The dashboard updates from this.</p>
        </div>
      </div>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Card bordered={false} title="Account rules" loading={loading}>
            <Form form={settingsForm} layout="vertical" className="entry-form" onFinish={run(api.saveSettings, "Rules saved")}>
              {settingFields.map(([name, label]) => (
                <Form.Item key={name} name={name} label={label} rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              ))}
              <Button type="primary" htmlType="submit">Save rules</Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card bordered={false} title="Add daily entry">
            <Form
              layout="vertical"
              className="entry-form"
              initialValues={{ date: moment() }}
              onFinish={run(
                ({ date, capital, equity, dailyLoss }) => api.saveEntry({ date: date.format("YYYY-MM-DD"), capital, equity, dailyLoss }),
                "Entry saved"
              )}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                    <DatePicker allowClear={false} inputReadOnly />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="capital" label="Capital (closed balance)">
                    <InputNumber addonBefore="$" placeholder="Closed trades only" inputMode="decimal" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="equity" label="Equity (incl. open trades)" rules={[{ required: true }]}>
                    <InputNumber addonBefore="$" placeholder="Live account value" inputMode="decimal" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="dailyLoss" label="Daily loss used">
                    <InputNumber addonBefore="$" min={0} placeholder="0.00" inputMode="decimal" />
                  </Form.Item>
                </Col>
              </Row>
              <div className="entry-hint">Leave capital blank to use equity. Saving an existing date overwrites it.</div>
              <Button type="primary" htmlType="submit" size="large" block>Save entry</Button>
            </Form>
            <Title level={5} style={{ margin: "24px 0 8px" }}>History</Title>
            <Table
              size="small"
              scroll={{ x: "max-content" }}
              rowKey="date"
              pagination={{ pageSize: 8, hideOnSinglePage: true }}
              dataSource={withPnl(entries).reverse()}
              columns={[
                { title: "Date", dataIndex: "date" },
                { title: "Capital", dataIndex: "capital" },
                { title: "Equity", dataIndex: "equity" },
                {
                  title: "Day P/L",
                  dataIndex: "pnl",
                  render: (v) => <span style={{ color: v >= 0 ? "#3ddc84" : "#ff6b6b" }}>{v >= 0 ? "+" : ""}{v.toFixed(2)}</span>,
                },
                { title: "Daily loss", dataIndex: "dailyLoss" },
                {
                  render: (_, r) => (
                    <Popconfirm title="Delete entry?" onConfirm={run(() => api.deleteEntry(r.date), "Deleted")}>
                      <Button type="link" danger size="small">Delete</Button>
                    </Popconfirm>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

