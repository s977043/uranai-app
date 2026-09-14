import type { ProductTelemetryEvent } from "@/domain/telemetry/events";
import { validateTelemetryEvent } from "@/domain/telemetry/events";

export interface TelemetrySink {
  write(event: ProductTelemetryEvent): void | Promise<void>;
}

export class InMemoryTelemetrySink implements TelemetrySink {
  private readonly events: ProductTelemetryEvent[] = [];

  write(event: ProductTelemetryEvent): void {
    this.events.push(cloneEvent(event));
  }

  snapshot(): ProductTelemetryEvent[] {
    return this.events.map(cloneEvent);
  }

  clear(): void {
    this.events.length = 0;
  }
}

export async function recordTelemetryEvent(
  input: unknown,
  sink: TelemetrySink,
): Promise<ProductTelemetryEvent> {
  const result = validateTelemetryEvent(input);
  if (!result.ok) {
    throw new Error(`invalid telemetry event: ${result.errors.join("; ")}`);
  }

  await sink.write(result.event);
  return result.event;
}

function cloneEvent(event: ProductTelemetryEvent): ProductTelemetryEvent {
  return {
    ...event,
    properties: { ...event.properties },
  } as ProductTelemetryEvent;
}
