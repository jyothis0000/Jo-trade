import { useState } from "react";
import { Button, Card, Input } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { login } from "../useAccount";

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await login(pin);
      onUnlock();
    } catch (e) {
      setError(e.message);
      setPin("");
    }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f1117" }}>
      <Card style={{ width: 320, textAlign: "center", background: "#171a23", border: "1px solid #232838", borderRadius: 12 }}>
        <LockOutlined style={{ fontSize: 28, color: "#1890ff" }} />
        <h2 style={{ margin: "12px 0 20px", color: "#fff" }}>Enter PIN</h2>
        <Input.Password
          autoFocus
          size="large"
          maxLength={8}
          inputMode="numeric"
          value={pin}
          status={error ? "error" : undefined}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onPressEnter={submit}
          style={{ textAlign: "center", letterSpacing: 8 }}
        />
        <div style={{ color: "#ff6b6b", minHeight: 22, marginTop: 8 }}>{error}</div>
        <Button type="primary" block size="large" loading={busy} disabled={!pin} onClick={submit}>Unlock</Button>
      </Card>
    </div>
  );
}

export default PinGate;
