# Reading Vertical Slice — Multi-perspective Review Record

Tracking: #33 / PR #35

## Review scope

- Reflection Reading domain
- Product UI Vertical Slice
- Message Guardrail regression
- Browser session telemetry
- Metric Registry / Pilot readiness
- MLP / Lovability proxy review

## Review perspectives

### 1. Product

**Conclusion: Approve for Vertical Slice.**

Good:
- Experience Hypothesisが「当たる」ではなく「整う / 今日の一歩」に結び付いている
- 外部LLMを入れず、Core Experienceだけを検証対象に限定
- Reading回数最大化をSuccessにしていない

Finding:
- 実ユーザーが本当に価値を感じるかは未検証

Action:
- #15後のUser Observation / Polish LoopをMLP Release前Gateとして維持

### 2. UX / Lovability

**Conclusion: Proxy review pass; real observation required.**

Checked:
- Clarity: 冒頭で体験目的が読める
- Ritual: テーマ選択 → 一枚ひく の区切りがある
- Agency: 答えを決めず、問いと小さな行動へ戻す
- Completion: feedbackまで1フローで完結
- Mobile readability: feedbackをmobileでは縦並びへ修正

Finding:
- テーマ選択後に選び直せず、誤選択時の摩擦があった

Fix:
- 「テーマを選び直す」を追加

Residual:
- 実端末 / 実ユーザーでのLovabilityは未観察

### 3. Architecture

**Conclusion: Approve after changes.**

Good:
- Reflection Reading domainはpure
- Browser storageはadapterへ隔離
- UIはdomain reading / telemetry factoryを呼び出す
- external vendor dependency無し

Finding:
- UIがTelemetry payloadを直接構築しており、dimension / correlation driftの余地があった

Fix:
- `src/domain/telemetry/reflectionEvents.ts` を追加
- Started / Completed / Feedbackのpure factory + regression testを追加

### 4. Privacy

**Conclusion: Approve for session-local telemetry only.**

Good:
- free-form consultation無し
- PII propertyをContractでreject
- `anonymous_visitor_id = null`
- UUID v4 session / flow ID
- sessionStorage only

Findings / fixes:
- 壊れたsession IDをそのまま再利用しない
- invalid ID rotation時に古いeventをclearし、別session Evidence混在を防止
- PIIを含むpersisted eventは復元対象から除外

Residual:
- central Evidence source導入時はretention / deletion / access / destinationのPrivacy reviewが必須

### 5. Safety

**Conclusion: Approve for low-risk reflection experience.**

Good:
- future certainty無し
- 相手の気持ちの断定無し
- breakup / medical / legal / investment directive無し
- user-facing card copyをMessage Guardrail regressionで全件検査
- Human agencyを明示

Finding:
- Card title「手放す」がrelationship文脈で関係解消を示唆する余地

Fix:
- titleを中立な「軽くする」へ変更

Residual:
- deterministic Message Guardrailは包括Safety判定ではない。このIterationはfree-text / generated readingを扱わないため許容

### 6. Analytics / Evidence

**Conclusion: Approve after changes; observability remains partial.**

Good:
- `reading_started` / `reading_completed` / `reading_feedback_submitted`をsame flowで相関
- `reading_type: reflection`を独立dimension化
- target / guardrail metricを`partial`へ昇格
- Manual Real PilotはBlocked維持

Finding:
- helpfulnessから`feedback_reason_category`を推測していた

Fix:
- 理由を聞いていないので常に`none`
- factory testで推測禁止を固定

Evidence source:
- `browser-session-storage:v1`
- `uranai.telemetry.events.v1`
- session-local only

Residual:
- central / operational Evidence source無し
- `partial != observable`

### 7. QA / Delivery

**Conclusion: Approve.**

Regression added:
- deterministic card selection
- all reflection copy Message Guardrail
- valid / invalid browser session handling
- stale event clearing on session rotation
- PII persisted event rejection
- reflection telemetry lifecycle / correlation
- no inferred feedback reason
- Metric Registry / Pilot readiness contract validation via existing evals

Rollback:
- PR単位でUI / Reflection domain / browser telemetryをrevert可能
- external API / DB migration / billing side effect無し

Residual:
- browser interaction E2E / screenshot / real device verificationはshared test surface後

## Blockers found and resolved

1. Reading Product Flow未実装なのにobservable化する旧計画
2. `reflection` dimension不足
3. Telemetry failureでReadingが止まり得る境界
4. invalid session IDとstale Evidence混在
5. feedback reasonの推測
6. UIからTelemetry Contractがdriftしやすい構造
7. relationship文脈で曖昧な「手放す」タイトル
8. theme誤選択から戻れないUX
9. mobile feedback 3列固定
10. Event Taxonomyを目的以上に圧縮するdocs差分

すべてPR #35内で修正。

## Lovability proxy result

| Dimension | Proxy result | Note |
| --- | --- | --- |
| Clarity | Pass | 未来予測ではなく整理の一枚と明示 |
| Ritual | Pass | theme → draw → result |
| Safety | Pass | deterministic copy + guardrail |
| Agency | Pass | 自分への問い / 自分で選べる行動 |
| Actionability | Pass | 今日できる小さな一歩 |
| Calmness | Pass | fear / urgency / dependency CTA無し |
| Completion | Pass | feedbackまで一連 |
| Mobile readability | Proxy pass | code review上。real device未検証 |

## Final boundary

このReviewが承認するのは:

> **Vertical Slice implementation + session-local Product instrumentation**

承認しないもの:

- MLP Release readiness
- actual Lovability
- Retention
- operational Evidence observability
- Manual Real Pilot
- Controlled Autonomy

## Next gates

1. #15 shared / production test surface
2. operational central Evidence source
3. actual User Observation
4. Polish Loop
5. Manual Real Pilot
6. Controlled Autonomy entry review

## Final status

**Approved for the stated boundary.**

PR #35 final head `931ef7ee83a885cac8e25e34117ab06fd48a61fc` で以下を確認した。

- npm ci / lint / typecheck / test / AI eval contracts / build: Green
- mergeable: true
- unresolved review thread: 0
- 7視点レビューのBlocker: すべて反映済み

PR #35はsquash merge済み（`1a7fd5c069a4601dddc9fbb2d06d761b57938928`）。
