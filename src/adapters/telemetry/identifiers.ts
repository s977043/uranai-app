export type UuidGenerator = () => string;

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
