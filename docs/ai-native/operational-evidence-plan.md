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

Neon / Supabaseは現時点の候補でありallowlistではない。アプリ側ContractはPostgreSQL / `DATABASE_URL`に固定し、選択providerがそのContractへ適合することをEvidence ref付きで確認する。

### Change 3: paid resource provisioningをPhase Aへ含めない

現在接続Vercel TeamはHobby。production利用にはproduction-eligible planが必要。

課金やresource作成はDecisionをmainへ入れ、実装境界をレビューした後にHuman/account actionとして行う。

### Change 4: observable化をprovider provisionと同時に行わない

DBが存在するだけではobservableではない。

以下を実Evidenceで確認後に昇格する。

- Product emit
- server-side validation
- persistent write
- query/export
- retention/deletion
- public endpoint abuse/cost control
- Data Quality
- shared surface E2E

### Change 5: Readinessを自己申告booleanにしない

Operational Gateは、provisioning / plan / provider compatibility / ingestion / environment separation / Privacy / retention / Data Quality等の**fact + verification ref**からCIで導出する。

### Change 6: retentionはserver ingestion時刻を基準にする

Clientが送る`occurred_at`ではなく、server-generated `ingested_at`を30日retentionの基準にする。未来時刻等でretentionを回避できないようにする。

### Change 7: public endpointのcost / abuse境界をPhase Bへ含める

初回は1 event/request、16 KiB以下。abuse controlは必要だが、そのためのdurable client identityは追加しない。

## Phase A — Decision / Contract

Deliverables:

- [x] Vercel Pro以上をruntime採用方針に決定
- [x] PostgreSQL / `DATABASE_URL`をstorage contractに決定
- [x] Neon / Supabaseをcandidateとして記録しprovider lock-inを避ける
- [x] browser direct DB write禁止
- [x] session-only identityを維持
- [x] raw retention 30日 / `ingested_at`基準
- [x] Preview / Production credential分離
- [x] fail-open Product boundary
- [x] one event/request / 16 KiB request boundary
- [x] abuse control必須 / durable identity追加禁止
- [x] ingestion disable switch contract
- [x] machine-readable Operational Evidence Contract
- [x] Gateをfact + verification refから導出
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
- [ ] 1 event/request
- [ ] request body <= 16 KiB
- [ ] JSON parse failureは4xx
- [ ] `validateTelemetryEvent`をserver-side再実行
- [ ] unknown field reject
- [ ] Evidence repository port
- [ ] `TELEMETRY_INGESTION_ENABLED=false`ならpersistent writeしない
- [ ] DB failureでProduct Readingは止めない
- [ ] IP / User-AgentをEvidence payloadへコピーしない
- [ ] raw request bodyをapplication logへ出さない
- [ ] public endpointのabuse/cost control
- [ ] abuse controlのためにdurable client identityを追加しない
- [ ] abuse controlのverification refを残す

Provider-specific DB SDKはこのPhaseへ持ち込まない。

## Phase C — PostgreSQL persistence / query / deletion

Requirements:

- [ ] minimal telemetry table
- [ ] idempotency / duplicate semanticsを定義
- [ ] server-generated `ingested_at`
- [ ] `occurred_at` / `ingested_at`の役割を分離
- [ ] session / flow / event name query
- [ ] existing domain aggregationへ戻せるexport
- [ ] `ingested_at < now - 30 days` deletion query / runbook
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

Do not add client IP / User-Agent / consultation text / prompt / response。

## Phase D — Provider provisioning / deployment

Human / account action required:

- [ ] Vercel production-eligible plan
- [ ] `uranai-app` Vercel project
- [ ] DB provider selected
- [ ] selected providerのPostgreSQL / `DATABASE_URL`適合性をverification ref付きで確認
- [ ] Preview DB/resource or isolated credential
- [ ] Production DB/resource
- [ ] server-only `DATABASE_URL`
- [ ] `TELEMETRY_INGESTION_ENABLED`
- [ ] provider log / retention Privacy review

Current candidate providers: Neon / Supabase。candidateはallowlistではない。

No automatic paid-plan change from code review workflow。

## Phase E — Shared surface verification

- [ ] Preview deploy
- [ ] production-eligible plan verification ref
- [ ] synthetic safe Reading session
- [ ] central event arrival
- [ ] invalid / oversized payload rejection
- [ ] abuse/cost control verification
- [ ] Evidence query/export
- [ ] metric aggregation reproduction
- [ ] deletion dry-run / verification
- [ ] telemetry disable rollback
- [ ] PreviewからProduction DBへwriteできないことを確認
- [ ] Privacy review
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

This is MLP learning; infrastructure completion is not Product success。

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
6. QA / Eval — invalid / duplicate / missing / out-of-order / timestamp abuse
7. Delivery / Cost — disable / rollback / environment separation / public endpoint abuse / spend

## Stop conditions

- provider convenienceのためにbrowser direct DB writeへ変更
- specific DB providerをDomain/API Contractへ固定
- raw consultation / PIIを追加
- cross-session IDを追加
- client-controlled `occurred_at`をretention基準にする
- abuse controlのためにdurable identityを追加
- DB provisionだけでMetricをobservableへ昇格
- Vercel Hobbyをcommercial productionへ利用
- paid resourceをHuman判断なしで開始
- Manual PilotをUser Observation前に開始
- Controlled Autonomyへ先行
