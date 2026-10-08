// API for the dashboard. Run: npm run server (reads MONGODB_URI from .env.local)
// Some local resolvers refuse the SRV lookups mongodb+srv:// needs (querySrv ECONNREFUSED).
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const crypto = require("crypto");
const express = require("express");
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const port = process.env.PORT || 5000;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

const num = (v) => (v === "" || v == null ? NaN : Number(v));
const app = express();
app.use(express.json());

// PIN gate: POST /api/login {pin} -> bearer token; every other /api route needs it.
const PIN = process.env.DASHBOARD_PIN;
if (!PIN) { console.error("Set DASHBOARD_PIN in .env"); process.exit(1); }
const tokens = new Set(); // in memory: restarting the server logs everyone out
let fails = 0, lockedUntil = 0;
const same = (a, b) => {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

app.post("/api/login", (req, res) => {
  if (Date.now() < lockedUntil) return res.status(429).json({ error: "Too many attempts. Try again in a minute." });
  if (!same(req.body.pin, PIN)) {
    if (++fails >= 5) { fails = 0; lockedUntil = Date.now() + 60_000; } // ponytail: global lock, per-IP if multi-user
    return res.status(401).json({ error: "Wrong PIN" });
  }
  fails = 0;
  const token = crypto.randomBytes(32).toString("hex");
  tokens.add(token);
  res.json({ token });
});

app.use("/api", (req, res, next) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  return tokens.has(token) ? next() : res.status(401).json({ error: "Locked" });
});

// Single-account app: one settings doc + one entry per date.
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => res.status(500).json({ error: e.message }));

client
  .connect()
  .then(() => {
    const db = client.db("trading_dashboard");
    const settings = db.collection("settings");
    const entries = db.collection("entries");
    entries.createIndex({ date: 1 }, { unique: true });

    app.get("/api/account", wrap(async (req, res) => {
      res.json({
        settings: await settings.findOne({ _id: "main" }, { projection: { _id: 0 } }),
        entries: await entries.find({}, { projection: { _id: 0 } }).sort({ date: 1 }).toArray(),
      });
    }));

    app.put("/api/settings", wrap(async (req, res) => {
      const keys = ["initialBalance", "profitTarget", "minDays", "dailyLossLimit", "maxLossLimit"];
      const doc = Object.fromEntries(keys.map((k) => [k, num(req.body[k])]));
      if (Object.values(doc).some(Number.isNaN)) return res.status(400).json({ error: "All settings must be numbers" });
      await settings.updateOne({ _id: "main" }, { $set: doc }, { upsert: true });
      res.json(doc);
    }));

    app.post("/api/entries", wrap(async (req, res) => {
      const { date } = req.body;
      const doc = { date, equity: num(req.body.equity), dailyLoss: num(req.body.dailyLoss) || 0 };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(doc.equity))
        return res.status(400).json({ error: "date (YYYY-MM-DD) and equity are required" });
      await entries.updateOne({ date }, { $set: doc }, { upsert: true });
      res.json(doc);
    }));

    app.delete("/api/entries/:date", wrap(async (req, res) => {
      await entries.deleteOne({ date: req.params.date });
      res.json({ ok: true });
    }));

    app.listen(port, () => console.log(`API on http://localhost:${port}`));
  })
  .catch((e) => {
    console.error(`Cannot connect to MongoDB at ${uri.replace(/\/\/.*@/, "//***@")}\n${e.message}`);
    process.exit(1);
  });
