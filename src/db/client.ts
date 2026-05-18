import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// Reuse a global in dev to avoid exhausting connections with HMR.
const globalForDb = globalThis as unknown as {
  __postgresClient?: postgres.Sql;
  __drizzleDb?: ReturnType<typeof drizzle>;
};

export function getDb() {
  if (globalForDb.__drizzleDb) return globalForDb.__drizzleDb;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = globalForDb.__postgresClient ?? postgres(url, { prepare: false });
  if (!globalForDb.__postgresClient) globalForDb.__postgresClient = sql;

  const db = drizzle(sql);
  globalForDb.__drizzleDb = db;
  return db;
}

// For compatibility with simple call sites.
export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const real = getDb() as unknown as Record<PropertyKey, unknown>;
      return real[prop];
    },
  },
) as ReturnType<typeof drizzle>;
