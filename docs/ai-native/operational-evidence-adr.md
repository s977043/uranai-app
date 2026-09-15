# ADR: Operational Evidence Source / Deployment Decision

Status: Accepted for implementation  
Tracking: #15, #39  
Date: 2026-09-15

## Context

Reflection Reading Vertical Slice と session-local telemetry は実装済みだが、現在の `browser-session-storage:v1` は中央集約された operational Evidence source ではない。

そのため以下はまだ成立していない。

- shared / production surface での実ユーザー観察
- `metric:reading_flow_completion` / `metric:helpful_feedback_rate` の operational Evidence
- Manual Real Pilot
- Controlled Autonomy entry review

現在のrepoは Next.js 15.5、ローカル PostgreSQL 16、`DATABASE_URL` を持つ。一方、production DB client / schema / deploy先は未確定。

## Decision

### Application runtime

**Vercel Pro を production/shared surface の採用方針とする。**

理由:

- 現行Next.js App Router構成をそのまま運用しやすい
- Preview / Production surfaceを分離しやすい
- MLP前にself-host運用や追加runtime互換層を持ち込まない
- rollback / environment variable管理をmanaged platformへ寄せられる

現在接続済みTeamはHobbyであり、Hobbyはproduction/commercial用途には使わない。**Proへのupgradeや課金開始は本ADRでは実行しない。**

### Evidence storage contract

**PostgreSQL / `DATABASE_URL` をアプリ側の唯一のstorage contractとする。**

DB provider固有SDKをDomain/API Contractへ持ち込まない。

初回候補:

- Neon Postgres
- Supabase Postgres

provider最終選択はresource provision直前に行う。どちらを選んでも、Evidence ingestion / query contractはPostgreSQLとして維持する。

### Ingestion boundary

```text
Browser Product Flow
  ↓ best-effort POST
Next.js server route (/api/telemetry)
  ↓ validateTelemetryEvent
Telemetry Evidence Repository port
  ↓
PostgreSQL adapter
  ↓
Evidence query / export
  ↓
existing metric aggregation
```

BrowserからDBへ直接writeしない。

### Product failure boundary

Telemetry失敗はReadingを止めない。

- Product Value Flow > telemetry delivery
- client側はbest-effort
- server側invalid payloadはreject
- retry / queueは初回Pilotでは過剰実装しない

## Data contract

保存対象は既存 `ProductTelemetryEvent` のallowlistだけ。

Allowed:

- `event_name`
- `event_version`
- `occurred_at`
- `anonymous_session_id`
- `anonymous_visitor_id = null`
- allowlisted `properties`
- server generated `ingested_at`

Do not persist:

- consultation free text
- name / email / phone / address
- raw prompt / model response
- auth identifier
- client IP
- User-Agent
- arbitrary request headers
- arbitrary unknown payload fields

Platform/provider logsはProduct Evidence tableとは別物として扱う。providerの標準access log retentionはprovision時のPrivacy Reviewで確認する。

## Identity

初回Pilotはsession-only。

```text
anonymous_session_id only
reading_flow_id only
anonymous_visitor_id = null
cross-session identity = prohibited
```

D1 / D7 / repeat-readingは本ADRの範囲外。

## Retention / deletion

### Raw operational telemetry

**30日 retention**を初期値とする。

理由:

- Manual Pilot / User Observationの再評価には十分
- session-level識別子を長期保存しない
- Retention Validation用cross-session trackingを先取りしない

Deletion contract:

- `occurred_at < now - 30 days` のraw telemetryを削除可能であること
- deletion query/runbookを実装時に用意する
- Evidence export後もraw dataを無期限保持しない

Accepted Learning等の長期記録にはraw eventやsession IDをコピーせず、集約結果・Evidence ref・判断だけを残す。

## Environment separation

Preview / Productionはcredentialを分離する。

Rules:

- Preview deploymentからProduction Evidence DBへwriteしない
- Production `DATABASE_URL` はserver-only
- browserへDB credentialを露出しない
- localはdocker-compose PostgreSQLを利用可能
- shared preview用DBとproduction DBは別credentialを必須とする

## Access boundary

初回:

- Application server: insert + required query
- Human operator: Evidence query/export + deletion operation
- Browser: telemetry API call only
- Agent: raw DB credentialを持たない

AI AgentへDB write権限やAccepted Learning promotion権限を渡さない。

## Disable / rollback

server-side telemetry ingestionには明示的なdisable switchを持たせる。

予定contract:

```text
TELEMETRY_INGESTION_ENABLED=false | true
```

false時:

- telemetry APIは永続化しない
- Reading UIは継続する
- Metric Registryをobservableへ昇格しない

Production incident時はingestionを先にdisableし、Product surfaceを維持する。

## Observability promotion gate

以下を全て満たすまで target / guardrail Metricを `observable` にしない。

- Vercel production/shared surface provisioned
- Vercel plan is production-eligible
- central PostgreSQL provider selected and provisioned
- Preview / Production credential separation verified
- server-side ingestion operational
- `validateTelemetryEvent` server-side validation enabled
- reproducible Evidence query/export verified
- raw retention/deletion procedure verified
- Privacy review complete
- Data Quality signals reviewed

それまでは:

```yaml
metric:reading_flow_completion: partial
metric:helpful_feedback_rate: partial
Manual Real Pilot: blocked
```

## Rejected alternatives

### Vercel Hobby for production

Reject。事業利用のproduction surfaceとして扱わない。

### Self-host PostgreSQL + self-host Next.js now

Reject for current MLP stage。運用責務が増え、User Observationより先にインフラ作業が膨らむ。

### Browser → Supabase/DB direct write

Reject。public credentialとEvidence table write contractをbrowserへ露出しない。

### Analytics SaaS as primary Evidence source

Reject for first Pilot。Metric semantics / retention / exportを先にvendorへ固定しない。将来secondary sinkとして再検討可能。

## Implementation sequence

1. **Phase A — Decision Contract** (this ADR)
2. **Phase B — provider-neutral server ingestion + repository port**
3. **Phase C — PostgreSQL schema / adapter / query / deletion**
4. **Phase D — Vercel Pro + DB provider provision / environment wiring**
5. **Phase E — shared surface E2E / Evidence export / observability promotion**
6. Actual User Observation → Polish Loop
7. Manual Real Pilot
8. Controlled Autonomy Entry Review

## Non-goals

- paid resource creation in this ADR
- cross-session identity
- auth/profile storage
- consultation persistence
- raw AI prompt/response persistence
- payment
- Experiment auto-start
- Controlled Autonomy
