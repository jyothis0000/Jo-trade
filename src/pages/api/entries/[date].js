import { guarded } from "../../../lib/auth";
import { collections } from "../../../lib/db";

export default guarded(async (req, res) => {
  if (req.method !== "DELETE") return res.status(405).end();
  const { entries } = await collections();
  await entries.deleteOne({ date: req.query.date });
  res.json({ ok: true });
});
