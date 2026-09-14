export type UuidGenerator = () => string;

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SESSION_ID_PATTERN = new RegExp(`^session_${UUID_V4_PATTERN.source.slice(1, -1)}$`, "i");
const READING_FLOW_ID_PATTERN = new RegExp(
  `^reading-flow_${UUID_V4_PATTERN.source.slice(1, -1)}$`,
  "i",
);

function defaultUuidGenerator(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("crypto.randomUUID is required for anonymous telemetry identifiers");
  }
  return globalThis.crypto.randomUUID();
}

export function createAnonymousSessionId(
  generateUuid: UuidGenerator = defaultUuidGenerator,
): string {
  return `session_${generateUuid()}`;
}

export function createReadingFlowId(
  generateUuid: UuidGenerator = defaultUuidGenerator,
): string {
  return `reading-flow_${generateUuid()}`;
}

export function isAnonymousSessionId(value: string): boolean {
  return SESSION_ID_PATTERN.test(value);
}

export function isReadingFlowId(value: string): boolean {
  return READING_FLOW_ID_PATTERN.test(value);
}
