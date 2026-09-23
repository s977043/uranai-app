# PostgreSQL Operational Evidence — Phase C Review

Tracking: #46 / PR #47  
Depends on: #15, #39  
Status: Approved after blocking fixes; final-head CI required before merge.

## Review scope

Phase Cの対象は、provider-neutral server ingestion coreをlocal PostgreSQL persistenceとNext.js telemetry routeへ接続し、実DBでEvidence contractを検証すること。

このレビューは以下を**完了扱いにしない**。

- managed / central production Evidence
- Vercel production/shared surface
- production abuse/cost control
- production database TLS verification
- Preview / Production environment separation verification
- Metric `observable` promotion
- Actual User Observation
- Manual Real Pilot
- Controlled Autonomy

## Review summary

### 1. Product / MLP

Result: PASS

- Product Reading Flowの挙動・copy・fortune semanticsは変更していない。
- Telemetry failureはProduct Value Flowを止めない。
- Phase CはMLPの観測基盤であり、Product successやLovabilityの証明とは扱わない。
- `metric:reading_flow_completion` / `metric:helpful_feedback_rate` は`partial`のまま維持する。

### 2. Architecture

Result: PASS after fixes

- `TelemetryEvidenceRepository` portを維持し、PostgreSQL固有実装をadapterへ隔離。
- `pg` + `DATABASE_URL`を利用し、Neon / Supabase固有SDKをDomain/APIへ持ち込まない。
- Route → server ingestion core → Repositoryの責務を分離。
- poolは小さくboundedにし、runtime reuseを行う。
- queryはparameterized SQLのみ。
- query row limitは最大5,000件。
- DB write時にもEvent Contract / canonical `ingested_at`を再検証する。

Blocking fixes:

1. Persistence無しでrouteを先行公開しないようPhase B/C境界を修正。
2. Up migrationの`IF NOT EXISTS`を削除し、予期しないschema driftをfailさせる。
3. Repositoryがingestion coreだけを信頼せず、write前にcontractを再検証する。
4. reversed / zero-length Evidence windowをDB query前にrejectする。

### 3. Privacy

Result: PASS for local Phase C; production remains blocked

Persisted Product Evidenceは以下だけ。

- event_name / event_version
- occurred_at
- server-generated ingested_at
- anonymous_session_id
- anonymous_visitor_id = null
- allowlisted properties

保存しない:

- IP
- User-Agent
- arbitrary request headers
- consultation free text
- name / email / phone / address
- raw prompt / model response
- durable cross-session identity

DB constraintでも`anonymous_visitor_id IS NULL`を強制。

Shared Vercel surfaceでは
`TELEMETRY_INGESTION_ENABLED=true`だけでは有効化せず、
`TELEMETRY_ABUSE_CONTROL_VERIFIED=true`も要求するfail-closed guardを追加した。

Production DBはTLS verification方法を明示レビューし、Evidence refが無ければOperational Gateを通さない。

### 4. Safety

Result: PASS

- Reading生成・解釈・Safety Policyには変更なし。
- high-stakes advice、fear/vulnerability targeting、pricing/billingに影響なし。
- Telemetryは構造化Eventのみでfree-text consultationを追加していない。
- Evidence基盤の完成を理由にHuman Gateを緩めていない。

### 5. Analytics / Evidence

Result: PASS for local integration

Time semanticsを分離。

- `ingested_at`: central Evidence window / retention / deletion
- `occurred_at`: same-flow ordering / existing metric Data Quality

重複eventはDBでdedupeせずEvidenceとして残し、既存metric aggregationでduplicate DQとして観測する。

PostgreSQL 16 integrationで以下を実証。

- migration
- insert
- `ingested_at` half-open window export
- session / flow / event filter
- existing Reading Flow Completion再計算
- existing Helpful Feedback Rate再計算
- duplicate Evidence → duplicate DQ
- future `occurred_at`でも古い`ingested_at`ならretention対象
- non-null anonymous_visitor_id DB rejection

Evidence:
`github-actions:run/35818293842#PostgreSQL-integration`

このEvidenceはlocal integrationに限定し、managed/shared Evidenceの再現性を意味しない。

### 6. QA / Eval

Result: PASS after fixes

CIへPostgreSQL 16 serviceを追加。

Validation layers:

- unit tests
- PostgreSQL integration
- AI/Evidence contract validators
- typecheck / lint / build

Blocking fixes:

1. Integration testsが前testのDB stateに依存していた。
   - 各test前に`TRUNCATE ... RESTART IDENTITY`し独立化。
2. request bodyはContent-Lengthだけで信頼せずstream実測byte数でも16KiBを強制。
3. stream read/cancel failureをsanitized 4xxへ閉じ込める。
4. package.json / package-lockのpg versionをcontract validatorで同期。
5. migrationがschema driftを隠さないことをvalidatorで固定。
6. local integration verifiedには実CI Evidence refを必須化。

### 7. Delivery / Cost

Result: PASS for Phase C; Phase D/E remains Human-gated

- paid resourceを作成していない。
- Vercel plan変更なし。
- managed DB provisionなし。
- default telemetry ingestion = OFF。
- shared Vercel surfaceはabuse-control verification前にfail-closed。
- pool max 3 / connection timeout 3s / idle timeout 10s。
- rollback SQL / 30-day deletion runbookを用意。
- 自動retention cronはまだ導入しない。

## Blocking findings resolved

1. Persistence無しrouteの先行公開
2. HTTP body boundaryとDB acquisition順序
3. Shared surfaceの誤有効化リスク
4. reversed Evidence query window
5. `IF NOT EXISTS`によるmigration drift隠蔽
6. adapter write時のcontract再検証不足
7. PostgreSQL integration testのstate/order依存
8. production PostgreSQL TLS verification Gate不足
9. local integration Evidenceのmachine-readable provenance不足

## Residual blockers

Phase C merge後も以下は未完了。

- Vercel production-eligible plan / project
- managed PostgreSQL provider selection / provisioning
- selected provider PostgreSQL compatibility verification
- production TLS verification
- actual abuse/cost control + verification
- Preview / Production credential separation verification
- provider/platform access log Privacy review
- shared-surface E2E
- operational query/export verification
- operational retention/deletion verification
- browser network sink
- Metric `partial → observable`
- Actual User Observation / Polish Loop
- Manual Real Pilot
- Controlled Autonomy

## Final decision

**APPROVED FOR PHASE C MERGE, conditional on final-head CI Green and unresolved review thread 0.**

Phase C completion means:

> PostgreSQL Evidence persistence contract and route are locally integrated and reproducibly tested.

It does **not** mean:

> Operational Evidence is production-ready or that Manual Real Pilot can start.
