import dns from "dns";
import { MongoClient } from "mongodb";

// Some local resolvers refuse the SRV lookups mongodb+srv:// needs (querySrv ECONNREFUSED).
for (const d of [dns, dns.promises]) d.setServers(["8.8.8.8", "1.1.1.1"]);

// Cached on globalThis so dev hot-reload doesn't open a new connection per edit.
// A failed connect is not cached, so the next request retries.
const g = globalThis;
function connect() {
  g._mongo ??= new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017", {
    serverSelectionTimeoutMS: 5000,
  })
    .connect()
    .catch((e) => {
      g._mongo = null;
      throw e;
    });
  return g._mongo;
}

export async function collections() {
  const db = (await connect()).db("trading_dashboard");
  const entries = db.collection("entries");
  g._indexed ??= entries.createIndex({ date: 1 }, { unique: true });
  await g._indexed;
  return { settings: db.collection("settings"), entries };
}
