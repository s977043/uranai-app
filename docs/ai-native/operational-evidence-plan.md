# Operational Evidence Source — Execution Plan

Tracking: #15, #39  
Decision: [`operational-evidence-adr.md`](./operational-evidence-adr.md)

## Objective

Reflection Readingのsession telemetryを、Privacy境界を保ったまま中央Evidenceへ接続し、実ユーザー観察とManual Real Pilotに使える状態へする。

成果はDBを置くことではなく、**User Observation → Evidence → Learning → Polish Loop** が再現可能になること。

## Current state

```text
Reflection Reading Vertical Slice      ✅
Product telemetry wiring              ✅
Session-local browser Evidence        ✅
Reading Flow Completion               partial
Helpful Feedback Rate                 partial
Execution Receipt hardening           ✅

Deployment/Evidence Decision          ← Phase A
Server-side ingestion                 🔒
Central PostgreSQL Evidence            🔒
Shared surface E2E                    🔒
Metric observable                     🔒
Actual User Observation               🔒
Manual Real Pilot                      🔒
Controlled Autonomy                   🔒
```

## Plan review — 2026-09-15

### Change 1: #15 / #39を別々に実装しない

DeploymentとEvidence storageを別々に決めると、secret管理・environment separation・DB connection方式が二重設計になる。

したがって#15と#39を同じDecision Contractで扱う。

### Change 2: providerをコードContractへ埋め込まない

Neon / Supabaseの最終選択前でも進められるよう、アプリ側ContractはPostgreSQL / `DATABASE_URL`に固定する。

### Change 3: paid resource provisioningをPhase Aへ含めない

現在接続Vercel TeamはHobby。production利用にはproduction-eligible planが必要。

課金やresource作成はDecisionをmainへ入れ、実装境界をレビューした後に行う。

### Change 4: observable化をprovider provisionと同時に行わない

DBが存在するだけではobservableではない。

以下を実Evidenceで確認後に昇格する。

- Product emit
- server-side validation
- persistent write
- query/export
- retention/deletion
- Data Quality
- shared surface E2E

## Phase A — Decision / Contract

Deliverables:

- [x] Vercel Proをruntime採用方針に決定
- [x] PostgreSQL / `DATABASE_URL`をstorage contractに決定
- [x] browser direct DB write禁止
- [x] session-only identityを維持
- [x] raw retention 30日
- [x] Preview / Production credential分離
- [x] fail-open Product boundary
- [x] ingestion disable switch contract
- [x] machine-readable Operational Evidence Contract
- [x] CI validator
- [ ] 7視点レビュー
- [ ] PR merge

Phase Aでは`operational_gate.status = blocked`が正しい結果。

## Phase B — Provider-neutral server ingestion

Target files (planned):

- `src/app/api/telemetry/route.ts`
- `src/adapters/telemetry/evidenceRepository.ts`
- `src/adapters/telemetry/serverIngestion.ts`
- tests

Requirements:

- [ ] `POST /api/telemetry`
- [ ] request body size limit
- [ ] JSON parse failureは4xx
- [ ] `validateTelemetryEvent`をserver-side再実行
- [ ] unknown field reject
- [ ] Evidence repository port
- [ ] `TELEMETRY_INGESTION_ENABLED=false`ならpersistent writeしない
- [ ] DB failureでProduct Readingは止めない
- [ ] IP / User-AgentをEvidence payloadへコピーしない
- [ ] raw request bodyをlogしない

Provider-specific DB SDKはこのPhaseへ持ち込まない。

## Phase C — PostgreSQL persistence / query / deletion

Requirements:

- [ ] minimal telemetry table
- [ ] idempotency / duplicate semanticsを定義
- [ ] `occurred_at` / `ingested_at`
- [ ] session / flow / event name query
- [ ] existing domain aggregationへ戻せるexport
- [ ] raw data 30日 deletion query / runbook
- [ ] migration strategy
- [ ] local PostgreSQL integration test
- [ ] Preview / Production credential separation contract

### Minimal stored columns

```text
id
 event_name
 event_version
 occurred_at
 ingested_at
 anonymous_session_id
 anonymous_visitor_id (must remain null for first pilot)
 properties (validated JSON)
```

Do not add client IP / User-Agent / consultation text / prompt / response.

## Phase D — Provider provisioning / deployment

Human / account action required:

- [ ] Vercel production-eligible plan
- [ ] `uranai-app` Vercel project
- [ ] DB provider selected: Neon or Supabase
- [ ] Preview DB/resource or isolated credential
- [ ] Production DB/resource
- [ ] server-only `DATABASE_URL`
- [ ] `TELEMETRY_INGESTION_ENABLED`
- [ ] provider log / retention Privacy review

No automatic paid-plan change from code review workflow.

## Phase E — Shared surface verification

- [ ] Preview deploy
- [ ] synthetic safe Reading session
- [ ] central event arrival
- [ ] invalid payload rejection
- [ ] Evidence query/export
- [ ] metric aggregation reproduction
- [ ] deletion dry-run / verification
- [ ] telemetry disable rollback
- [ ] Data Quality check

Only after this:

```yaml
metric:reading_flow_completion: observable
metric:helpful_feedback_rate: observable
```

## Phase F — User Observation / Polish Loop

- [ ] low-risk users / testers only
- [ ] observe Reading completion
- [ ] collect structured helpfulness only
- [ ] no free-text consultation collection
- [ ] review friction / confusion / usefulness
- [ ] Polish Loop
- [ ] repeat shared-surface verification

This is MLP learning; infrastructure completion is not Product success.

## Phase G — Manual Real Pilot

Entry gate:

- target Metric observable
- guardrail Metric observable
- Evidence source operational
- shared surface operational
- actual User Observation completed
- Privacy/Safety review complete
- Human owner / stop / rollback defined

Then one low-risk reversible Experiment may run through:

```text
Proposal
→ Human Approval
→ Manual Execution
→ Execution Receipt
→ Evidence
→ Evaluation
→ Candidate
→ Independent Review
→ Human Decision
→ MLP Polish / Next Hypothesis
```

## Review perspectives

Before each phase completion:

1. Product / MLP — User Observationに必要なものだけか
2. Architecture — Port / adapter / provider boundary
3. Privacy — minimization / retention / deletion / access
4. Safety — sensitive/high-risk dataを増やしていないか
5. Analytics — Metric definitionとEvidence queryが一致するか
6. QA / Eval — invalid / duplicate / missing / out-of-order
7. Delivery / DX — disable / rollback / environment separation / cost

## Stop conditions

- provider convenienceのためにbrowser direct DB writeへ変更
- raw consultation / PIIを追加
- cross-session IDを追加
- DB provisionだけでMetricをobservableへ昇格
- Vercel Hobbyをcommercial productionへ利用
- paid resourceをHuman判断なしで開始
- Manual PilotをUser Observation前に開始
- Controlled Autonomyへ先行
