/**
 * Cost-aware anonymous ingress controls.
 *
 * This is deliberately instance-local: it cannot prove global request volume,
 * prevent distributed abuse, or replace an independently verified edge policy.
 * No IP address, User-Agent, cookies, or cross-session identity are needed.
 */
export const TELEMETRY_INSTANCE_REQUESTS_PER_MINUTE = 60;
export const TELEMETRY_INSTANCE_WINDOW_MS = 60_000;
export const TELEMETRY_SHARED_INGRESS_APPROVAL_ENV =
  "TELEMETRY_SHARED_INGRESS_APPROVED";

type TelemetryActivation = {
  readonly enabled: string | undefined;
  readonly sharedApproved: string | undefined;
  readonly nodeEnv: string | undefined;
  readonly vercelEnv: string | undefined;
};

export function telemetryIngressEnabled(input: TelemetryActivation): boolean {
  if (input.enabled !== "true") return false;

  // Unknown runtimes are shared by default; only explicit local/test can
  // activate without a separately approved shared ingress.
  const explicitlyLocal =
    (input.nodeEnv === "development" || input.nodeEnv === "test") &&
    (input.vercelEnv === undefined || input.vercelEnv === "development");

  return explicitlyLocal || input.sharedApproved === "true";
}

export type RateLimitDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly retryAfterSeconds: number };

export interface TelemetryRateLimiter {
  consume(): RateLimitDecision;
}

/**
 * Fixed-window process-local limit. Consumes before parsing the request, so
 * invalid traffic is also charged against the small local budget.
 */
export class AnonymousTelemetryRateLimiter implements TelemetryRateLimiter {
  private startMs: number | null = null;
  private count = 0;

  constructor(
    private readonly now: () => number = Date.now,
    private readonly maxRequests = TELEMETRY_INSTANCE_REQUESTS_PER_MINUTE,
    private readonly windowMs = TELEMETRY_INSTANCE_WINDOW_MS,
  ) {
    if (!Number.isSafeInteger(maxRequests) || maxRequests < 1) {
      throw new RangeError("maxRequests must be a positive safe integer");
    }
    if (!Number.isSafeInteger(windowMs) || windowMs < 1) {
      throw new RangeError("windowMs must be a positive safe integer");
    }
  }

  consume(): RateLimitDecision {
    const current = this.now();

    // Clock failure must deny requests, never silently remove the limit.
    if (!Number.isFinite(current)) {
      return { allowed: false, retryAfterSeconds: 1 };
    }

    if (
      this.startMs === null ||
      current - this.startMs >= this.windowMs
    ) {
      this.startMs = current;
      this.count = 0;
    }

    // Clock rollback must not reset the budget.
    if (current < this.startMs) {
      // Never emit a huge Retry-After after a system-clock rollback.
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil(this.windowMs / 1_000)),
      };
    }

    if (this.count >= this.maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((this.startMs + this.windowMs - current) / 1_000),
        ),
      };
    }

    this.count += 1;
    return { allowed: true };
  }
}
