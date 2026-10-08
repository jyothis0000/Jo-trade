import { useEffect } from "react";
import { Alert, Button, Card, Col, Form, InputNumber, DatePicker, Popconfirm, Row, Table, Typography, message } from "antd";
import { api, useAccount } from "../useAccount";

const { Title } = Typography;
const settingFields = [
  ["initialBalance", "Initial balance ($)"],
  ["profitTarget", "Profit target ($)"],
  ["minDays", "Min trading days"],
  ["dailyLossLimit", "Daily loss limit ($)"],
  ["maxLossLimit", "Max loss limit ($)"],
];

function DataEntry() {
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
            <Form form={settingsForm} layout="vertical" onFinish={run(api.saveSettings, "Rules saved")}>
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
              layout="inline"
              onFinish={run(
                ({ date, equity, dailyLoss }) => api.saveEntry({ date: date.format("YYYY-MM-DD"), equity, dailyLoss }),
                "Entry saved"
              )}
            >
              <Form.Item name="date" rules={[{ required: true }]}><DatePicker /></Form.Item>
              <Form.Item name="equity" rules={[{ required: true }]}><InputNumber placeholder="Equity $" style={{ width: 130 }} /></Form.Item>
              <Form.Item name="dailyLoss"><InputNumber min={0} placeholder="Daily loss $" style={{ width: 130 }} /></Form.Item>
              <Button type="primary" htmlType="submit">Save</Button>
            </Form>
            <Title level={5} style={{ margin: "24px 0 8px" }}>History (same date overwrites)</Title>
            <Table
              size="small"
              rowKey="date"
              pagination={{ pageSize: 8, hideOnSinglePage: true }}
              dataSource={[...entries].reverse()}
              columns={[
                { title: "Date", dataIndex: "date" },
                { title: "Equity", dataIndex: "equity" },
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

export default DataEntry;
