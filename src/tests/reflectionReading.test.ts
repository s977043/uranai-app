import { describe, expect, it } from "vitest";

import { inspectMessage } from "@/domain/messageGuardrail";
import {
  createReflectionReading,
  REFLECTION_CARDS,
  type ReadingContext,
} from "@/domain/reflectionReading";

describe("reflection reading", () => {
  it("is deterministic for the same seed and context", () => {
    expect(createReflectionReading("seed-1", "work")).toEqual(
      createReflectionReading("seed-1", "work"),
    );
  });

  it("keeps context-specific framing without changing the selected deterministic card", () => {
    const contexts: ReadingContext[] = ["self_reflection", "work", "relationship"];
    const readings = contexts.map((context) => createReflectionReading("same-seed", context));

    expect(new Set(readings.map((reading) => reading.card.id)).size).toBe(1);
    expect(new Set(readings.map((reading) => reading.contextPrompt)).size).toBe(3);
  });

  it("always selects a card from the versioned reflection card set", () => {
    for (let index = 0; index < 100; index += 1) {
      const reading = createReflectionReading(`seed-${index}`, "self_reflection");
      expect(REFLECTION_CARDS.some((card) => card.id === reading.card.id)).toBe(true);
      expect(reading.version).toBe(1);
    }
  });

  it("all user-facing reflection copy passes the deterministic message guardrail", () => {
    for (const card of REFLECTION_CARDS) {
      for (const text of [card.title, card.keyword, card.interpretation, card.question, card.nextAction]) {
        expect(inspectMessage(text), `${card.id}: ${text}`).toEqual({ ok: true, violations: [] });
      }
    }

    for (const context of ["self_reflection", "work", "relationship"] as const) {
      const reading = createReflectionReading("guardrail-seed", context);
      expect(inspectMessage(reading.contextPrompt).ok).toBe(true);
    }
  });
});
