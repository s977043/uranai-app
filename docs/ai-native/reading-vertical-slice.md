# Reading Vertical Slice — Reflection Reading

Tracking: #33

## Experience Hypothesis

> 迷いを抱えたユーザーが、短い1枚のリフレクションReadingを終えたとき、未来を断定されるのではなく、今の気持ちが少し整理され、今日できる一歩を1つ持ち帰れる。

SuccessはReading回数の最大化ではない。

観察したいSignal:

- 体験の目的が説明なしでも理解できる
- 結果を「未来予測」ではなく「自己整理」として受け取れる
- 自分への問いに意味を感じる
- 今日の一歩が実行可能な粒度になっている
- feedbackまで自然に到達する
- もう一度使いたい理由が「不安だから繰り返す」ではなく「整理したい時に戻れる」である

## Vertical Slice

```text
Entry
  ↓
テーマ選択
  ├─ 今の自分
  ├─ 仕事
  └─ 人間関係
  ↓
Reading Start
  ↓
1枚ひく
  ↓
Reflection Card
  ├─ keyword
  ├─ context framing
  ├─ interpretation
  ├─ reflection question
  └─ today action
  ↓
Helpful / Neutral / Not helpful
```

## Why no external LLM yet

このIterationではModel性能を検証しない。

先に検証するのは:

- Core Experienceが価値を持つか
- Product / Safety boundaryが成立するか
- Telemetryが実Product Flowへ接続できるか
- Feedback loopへ戻せるか

外部LLMを先に入れると、Experience問題とModel問題が混ざるため導入しない。

## Deterministic / Interpretation boundary

### Deterministic fact

- `reading_flow_id`をseedにversioned card setから1枚を決定
- 同じseedなら同じcard
- card id/titleは生成AIに決めさせない

### Versioned interpretation

- interpretation
- reflection question
- today action
- context framing

これらは`src/domain/reflectionReading.ts`でversion管理する。

全user-facing copyを`Message Guardrail`回帰テスト対象にする。

## Privacy boundary

- free-form consultation無し
- name / email / phone無し
- raw prompt / model response無し
- cross-session identity無し
- `anonymous_visitor_id = null`
- browser `sessionStorage`のみ
- browser sessionを越える保存無し

Telemetry失敗はReadingを停止しない。

## Telemetry

Product Flowから次をemitする。

```text
theme selected    → reading_started
result created    → reading_completed
feedback selected → reading_feedback_submitted
```

共通:

- `reading_type = reflection`
- same `reading_flow_id`
- same browser session ID
- feedback reasonはユーザーに理由を聞いていないため`none`。helpfulnessから推測しない

### Session-local Evidence source

Metric Registryの `browser-session-storage:v1` は以下を指す。

```text
session id key: uranai.telemetry.session-id.v1
event key:      uranai.telemetry.events.v1
```

Evidence取得手順:

1. 同一browser sessionでVertical Sliceを実行する
2. `sessionStorage["uranai.telemetry.events.v1"]` を取得する
3. `validateTelemetryEvent` と同じContractでschema-valid eventだけを扱う
4. `calculateReadingFlowCompletion` / `calculateHelpfulFeedbackRate`でsession-level集約する

注意:

- これは開発・proxy observation用のsession-local Evidence
- browserを跨いだ中央集約ではない
- Product運用の正本Evidenceにはしない
- invalid session IDをローテーションした場合は古いeventをクリアし、別session Evidenceを混在させない

### Observability status

`browser-session-storage:v1`はsession-local Evidence surfaceであり、中央集約されたoperational Evidence sourceではない。

したがって:

```yaml
metric:reading_flow_completion: partial
metric:helpful_feedback_rate: partial
```

`observable`へ昇格しない。

## Lovability Review rubric

実ユーザー観察前のproxy reviewでは以下を見る。

1. **Clarity** — 3秒で何をする体験か理解できるか
2. **Ritual** — 単なるフォームではなく、一枚ひく体験として区切りがあるか
3. **Safety** — 未来・相手の気持ち・重大判断を断定しないか
4. **Agency** — ユーザー自身の判断を残しているか
5. **Actionability** — 今日の一歩が小さく具体的か
6. **Calmness** — 不安・依存・希少性を煽らないか
7. **Completion** — feedbackまで自然に一連の体験として完結するか
8. **Mobile readability** — 狭い画面でも読み順が明確か

## What this iteration can prove

- Reading Vertical Sliceがコード上端から端まで成立
- deterministic fact / interpretation boundaryが成立
- user-facing copyがdeterministic guardrailを通る
- Product telemetry wiringが成立
- session-local Evidence取得が可能
- target / guardrail Metricが`partial`になる条件を満たす

## What this iteration cannot prove

- 実ユーザーが本当に「整った」と感じる
- 継続利用したいと思う
- Retentionが成立する
- central Evidenceを再現可能に集約できる
- Production/shared surfaceで安定する

これらをSynthetic / proxy reviewから推定しない。

## Next gates

1. #15 shared / production test surface
2. operational central Evidence source
3. Privacy review for persistence / retention / deletion
4. actual User Observation
5. Polish Loop
6. Manual Real Pilot

Manual Real Pilotが完了するまでControlled Autonomyへ進まない。
