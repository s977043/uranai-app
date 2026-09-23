import { Pool } from "pg";

const DEFAULT_MAX_POOL_SIZE = 3;
const DEFAULT_CONNECTION_TIMEOUT_MS = 3_000;
const DEFAULT_IDLE_TIMEOUT_MS = 10_000;

type GlobalWithTelemetryPool = typeof globalThis & {
  __uranaiTelemetryPool?: Pool;
};

const globalWithPool = globalThis as GlobalWithTelemetryPool;

export function createTelemetryPool(connectionString: string): Pool {
  if (connectionString.trim().length === 0) {
    throw new Error("DATABASE_URL is required");
  }

  return new Pool({
    connectionString,
    max: DEFAULT_MAX_POOL_SIZE,
    connectionTimeoutMillis: DEFAULT_CONNECTION_TIMEOUT_MS,
    idleTimeoutMillis: DEFAULT_IDLE_TIMEOUT_MS,
    allowExitOnIdle: true,
  });
}

export function getTelemetryPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  if (globalWithPool.__uranaiTelemetryPool === undefined) {
    globalWithPool.__uranaiTelemetryPool = createTelemetryPool(connectionString);
  }
  return globalWithPool.__uranaiTelemetryPool;
}
