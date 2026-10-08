import { guarded } from "../../../lib/auth";
import { collections } from "../../../lib/db";

const num = (v) => (v === "" || v == null ? NaN : Number(v));

export default guarded(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const { date } = req.body;
  const equity = num(req.body.equity);
  const doc = { date, equity, capital: num(req.body.capital), dailyLoss: num(req.body.dailyLoss) || 0 };
  if (Number.isNaN(doc.capital)) doc.capital = equity; // old entries / blank field: capital = equity
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(doc.equity))
    return res.status(400).json({ error: "date (YYYY-MM-DD) and equity are required" });
  const { entries } = await collections();
  await entries.updateOne({ date }, { $set: doc }, { upsert: true });
  res.json(doc);
});
