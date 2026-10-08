import { makeToken, pinOk } from "../../lib/auth";

let fails = 0, lockedUntil = 0; // ponytail: global lock, per-IP if multi-user

export default function handler(req, res) {
  if (!process.env.DASHBOARD_PIN) return res.status(500).json({ error: "Set DASHBOARD_PIN in .env" });
  if (Date.now() < lockedUntil) return res.status(429).json({ error: "Too many attempts. Try again in a minute." });
  if (!pinOk(req.body?.pin)) {
    if (++fails >= 5) { fails = 0; lockedUntil = Date.now() + 60_000; }
    return res.status(401).json({ error: "Wrong PIN" });
  }
  fails = 0;
  res.json({ token: makeToken() });
}
