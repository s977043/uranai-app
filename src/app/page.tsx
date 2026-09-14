"use client";

import { useRef, useState } from "react";

import {
  getOrCreateAnonymousSessionId,
  SessionStorageTelemetrySink,
} from "@/adapters/telemetry/browserSession";
import { createReadingFlowId } from "@/adapters/telemetry/identifiers";
import { recordTelemetryEvent } from "@/adapters/telemetry/sink";
import {
  createReflectionReading,
  type ReadingContext,
  type ReflectionReading,
} from "@/domain/reflectionReading";
import type {
  DurationBucket,
  Helpfulness,
  ProductTelemetryEvent,
} from "@/domain/telemetry/events";
import {
  reflectionReadingCompleted,
  reflectionReadingFeedbackSubmitted,
  reflectionReadingStarted,
} from "@/domain/telemetry/reflectionEvents";

const CONTEXTS: readonly {
  value: ReadingContext;
  label: string;
  description: string;
}[] = [
  {
    value: "self_reflection",
    label: "今の自分",
    description: "考えが散らかっているときに、いま大切なことを一つ見つける。",
  },
  {
    value: "work",
    label: "仕事",
    description: "正解を決めるより、次に試せる小さな行動を見つける。",
  },
  {
    value: "relationship",
    label: "人間関係",
    description: "相手を決めつけず、自分が大切にしたいことへ戻る。",
  },
] as const;

function durationBucket(startedAt: number, completedAt: number): DurationBucket {
  const seconds = (completedAt - startedAt) / 1000;
  if (seconds < 30) return "lt_30s";
  if (seconds <= 120) return "30s_2m";
  return "gt_2m";
}

export default function Home() {
  const [context, setContext] = useState<ReadingContext | null>(null);
  const [flowId, setFlowId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [reading, setReading] = useState<ReflectionReading | null>(null);
  const [feedback, setFeedback] = useState<Helpfulness | null>(null);
  const [telemetryError, setTelemetryError] = useState(false);
  const activeFlowRef = useRef<string | null>(null);
  const completedFlowRef = useRef<string | null>(null);
  const feedbackFlowRef = useRef<string | null>(null);

  async function emit(buildEvent: (sessionId: string) => ProductTelemetryEvent) {
    try {
      const storage = window.sessionStorage;
      const sessionId = getOrCreateAnonymousSessionId(storage);
      const sink = new SessionStorageTelemetrySink(storage);
      await recordTelemetryEvent(buildEvent(sessionId), sink);
    } catch {
      setTelemetryError(true);
    }
  }

  function startReading(nextContext: ReadingContext) {
    if (activeFlowRef.current !== null) return;

    const nextFlowId = createReadingFlowId();
    const now = Date.now();
    activeFlowRef.current = nextFlowId;
    completedFlowRef.current = null;
    feedbackFlowRef.current = null;

    setContext(nextContext);
    setFlowId(nextFlowId);
    setStartedAt(now);
    setReading(null);
    setFeedback(null);
    setTelemetryError(false);

    void emit((sessionId) =>
      reflectionReadingStarted({
        flowId: nextFlowId,
        sessionId,
        occurredAt: new Date(now).toISOString(),
        context: nextContext,
      }),
    );
  }

  function drawCard() {
    if (
      context === null ||
      flowId === null ||
      startedAt === null ||
      activeFlowRef.current !== flowId ||
      completedFlowRef.current === flowId
    ) {
      return;
    }

    completedFlowRef.current = flowId;
    const nextReading = createReflectionReading(flowId, context);
    const completedAt = Date.now();
    setReading(nextReading);

    void emit((sessionId) =>
      reflectionReadingCompleted({
        flowId,
        sessionId,
        occurredAt: new Date(completedAt).toISOString(),
        durationBucket: durationBucket(startedAt, completedAt),
      }),
    );
  }

  function submitFeedback(value: Helpfulness) {
    if (
      flowId === null ||
      feedback !== null ||
      completedFlowRef.current !== flowId ||
      feedbackFlowRef.current === flowId
    ) {
      return;
    }

    feedbackFlowRef.current = flowId;
    setFeedback(value);

    void emit((sessionId) =>
      reflectionReadingFeedbackSubmitted({
        flowId,
        sessionId,
        occurredAt: new Date().toISOString(),
        helpfulness: value,
      }),
    );
  }

  function reset() {
    activeFlowRef.current = null;
    completedFlowRef.current = null;
    feedbackFlowRef.current = null;
    setContext(null);
    setFlowId(null);
    setStartedAt(null);
    setReading(null);
    setFeedback(null);
    setTelemetryError(false);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#20204a_0%,#101126_38%,#090a16_72%)] px-5 py-10 text-slate-100 sm:px-8 sm:py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-3 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-violet-300">Reflection Reading</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">迷いを、やさしく言語化する。</h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            未来を決めつけるためではなく、今の気持ちを少し整理して、今日できる一歩を見つけるための一枚です。
          </p>
        </header>

        {context === null ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
            <div className="mb-6 space-y-2">
              <p className="text-sm text-violet-200">いま整えたいテーマ</p>
              <h2 className="text-xl font-medium sm:text-2xl">一つだけ選んでください</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {CONTEXTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => startReading(item.value)}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 text-left transition hover:-translate-y-0.5 hover:border-violet-300/50 hover:bg-violet-300/10 focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  <span className="block text-base font-medium text-white">{item.label}</span>
                  <span className="mt-2 block text-sm leading-6 text-slate-400">{item.description}</span>
                </button>
              ))}
            </div>
          </section>
        ) : reading === null ? (
          <section className="rounded-3xl border border-violet-300/20 bg-white/[0.07] p-7 text-center shadow-2xl shadow-black/30 backdrop-blur sm:p-10">
            <p className="text-sm text-violet-200">{CONTEXTS.find((item) => item.value === context)?.label}</p>
            <div className="mx-auto my-7 flex h-40 w-28 items-center justify-center rounded-[1.4rem] border border-violet-200/30 bg-gradient-to-b from-violet-300/20 to-indigo-950 shadow-[0_0_50px_rgba(167,139,250,0.16)]">
              <span aria-hidden="true" className="text-4xl">✦</span>
            </div>
            <h2 className="text-2xl font-medium">今のあなたに向けた一枚</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-300">
              正解を当てるのではなく、今の見方を少し広げるために使います。
            </p>
            <div className="mt-7 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={drawCard}
                className="rounded-full bg-violet-200 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-white"
              >
                一枚ひく
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-sm text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                テーマを選び直す
              </button>
            </div>
          </section>
        ) : (
          <section className="space-y-5 rounded-3xl border border-violet-300/20 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-9">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-violet-300">{reading.contextLabel}</p>
                <h2 className="mt-2 text-3xl font-semibold">{reading.card.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{reading.card.keyword}</p>
              </div>
              <div aria-hidden="true" className="flex h-16 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-200/30 bg-violet-300/10 text-xl">✦</div>
            </div>

            <div className="space-y-3">
              <p className="text-sm leading-7 text-violet-100">{reading.contextPrompt}</p>
              <p className="text-base leading-8 text-slate-200">{reading.card.interpretation}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">自分への問い</p>
              <p className="mt-2 text-lg leading-8 text-white">{reading.card.question}</p>
            </div>

            <div className="rounded-2xl border border-emerald-300/15 bg-emerald-200/[0.07] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">今日の一歩</p>
              <p className="mt-2 leading-7 text-slate-100">{reading.card.nextAction}</p>
            </div>

            <div className="border-t border-white/10 pt-5">
              <p className="text-center text-sm text-slate-300">このReadingは、今の整理に役立ちましたか？</p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {([
                  ["helpful", "役立った"],
                  ["neutral", "どちらでもない"],
                  ["not_helpful", "役立たなかった"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={feedback !== null}
                    onClick={() => submitFeedback(value)}
                    className={`rounded-xl border px-3 py-3 text-sm transition ${
                      feedback === value
                        ? "border-violet-200 bg-violet-200 text-slate-950"
                        : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-violet-300/40 disabled:opacity-40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {feedback !== null && (
                <p className="mt-3 text-center text-xs text-slate-400">
                  ありがとう。回答はこのブラウザセッション内にのみ記録されます。
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={reset}
              className="w-full rounded-full border border-white/15 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/[0.06]"
            >
              別のテーマで、もう一度
            </button>
          </section>
        )}

        {telemetryError && (
          <p role="status" className="text-center text-xs text-amber-200">
            利用状況の記録に失敗しました。Reading自体はそのまま利用できます。
          </p>
        )}

        <footer className="text-center text-xs leading-6 text-slate-500">
          この体験は意思決定を代行するものではありません。大切な判断は、ご自身の状況や専門家の助言も踏まえて決めてください。
        </footer>
      </div>
    </main>
  );
}
