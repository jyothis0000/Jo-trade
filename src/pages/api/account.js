import { guarded } from "../../lib/auth";
import { collections } from "../../lib/db";

export default guarded(async (req, res) => {
  const { settings, entries } = await collections();
  res.json({
    settings: await settings.findOne({ _id: "main" }, { projection: { _id: 0 } }),
    entries: await entries.find({}, { projection: { _id: 0 } }).sort({ date: 1 }).toArray(),
  });
});
