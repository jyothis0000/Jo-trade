import { guarded } from "../../lib/auth";
import { collections } from "../../lib/db";

const num = (v) => (v === "" || v == null ? NaN : Number(v));

export default guarded(async (req, res) => {
  if (req.method !== "PUT") return res.status(405).end();
  const keys = ["initialBalance", "profitTarget", "minDays", "dailyLossLimit", "maxLossLimit"];
  const doc = Object.fromEntries(keys.map((k) => [k, num(req.body[k])]));
  if (Object.values(doc).some(Number.isNaN)) return res.status(400).json({ error: "All settings must be numbers" });
  const { settings } = await collections();
  await settings.updateOne({ _id: "main" }, { $set: doc }, { upsert: true });
  res.json(doc);
});
