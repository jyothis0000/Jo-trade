import crypto from "crypto";

// Stateless token = "<expiry>.<hmac>", so it survives restarts (the old in-memory Set did not).
const sign = (exp) => crypto.createHmac("sha256", process.env.DASHBOARD_PIN).update(String(exp)).digest("hex");
const hash = (s) => crypto.createHash("sha256").update(String(s)).digest();

export const pinOk = (pin) => crypto.timingSafeEqual(hash(pin), hash(process.env.DASHBOARD_PIN));
export const makeToken = () => {
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  return `${exp}.${sign(exp)}`;
};

function valid(token) {
  const [exp, mac] = String(token).split(".");
  if (!exp || !mac || Number(exp) < Date.now()) return false;
  const a = Buffer.from(mac), b = Buffer.from(sign(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Wraps an API handler: PIN token required, errors become JSON 500.
export const guarded = (handler) => async (req, res) => {
  if (!process.env.DASHBOARD_PIN) return res.status(500).json({ error: "Set DASHBOARD_PIN in .env" });
  if (!valid((req.headers.authorization || "").replace("Bearer ", ""))) return res.status(401).json({ error: "Locked" });
  try {
    await handler(req, res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
