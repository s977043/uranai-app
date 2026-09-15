# Operational Evidence / Deployment Decision — Multi-perspective Review

Tracking: #15, #39, PR #43  
Scope: Phase A — Decision / Contract only

## Conclusion

**Approved with changes.**

Phase Aの目的は、paid infrastructureを作ることではなく、次のserver ingestion / PostgreSQL persistence / provisioning / shared-surface E2Eを安全に実装できるDecision Contractを固定すること。

レビューで見つかったBlocking findingsはすべてPR内で修正した。

現在の正しい状態:

```text
Decision / Contract          ready for merge
Operational Evidence Store   not implemented
Shared surface               not provisioned
Metric observable            no
Manual Real Pilot            blocked
Controlled Autonomy          blocked
```

## 1. Product / MLP

### Review

DecisionがInfrastructure deliveryを成果化していないか確認した。

### Finding

問題なし。

- User Observation → Evidence → Learning → Polish Loop が成果
- DB / hosting provisionは中間手段
- Telemetry failureはReadingを止めない
- paid resourceをPhase Aで作らない
- User Observation前にManual Real Pilotへ進まない

### Residual risk

Actual Lovability / Retentionは依然未検証。Phase AをProduct validationと誤認しない。

## 2. Architecture

### Blocking finding A — self-reported readiness

初期machine contractは `operational_gate.requirements.* = true|false` を手動で切り替える構造だった。

これでは実際のshared surface / storage / query Evidenceが無くても`true`を書くだけでoperationalへ進める。

### Fix

Gateを以下の**fact + verification ref**からCI導出する方式へ変更。

- runtime provision + shared surface ref
- production-eligible plan verification ref
- selected DB provider + PostgreSQL contract verification ref
- storage provisioning / Evidence source refs
- environment separation ref
- ingestion verification ref
- abuse control verification ref
- query/export ref
- retention/deletion ref
- Privacy review ref
- Data Quality ref

### Blocking finding B — provider-neutrality contradiction

初期ContractはNeon / Supabaseを`allowed_providers`として固定していた。

これは「PostgreSQL / DATABASE_URLをprovider-neutral contractにする」というADRと矛盾する。

### Fix

- Neon / Supabaseは`candidate_providers`
- selected providerは文字列として保持
- operationalへ進むには、selected providerがPostgreSQL / `DATABASE_URL` contractへ適合することをverification ref付きで確認

これにより将来別のmanaged PostgreSQLへ移行してもDomain/API Contract変更を必須にしない。

## 3. Privacy

### Blocking finding — retention basis

初期ADRではraw event削除をclient-controlled `occurred_at`基準としていた。

未来時刻等を送信された場合、retentionを回避できる。

### Fix

- raw retention: 30日
- retention basis: **server-generated `ingested_at`**
- `occurred_at`: event ordering / Metric / Data Quality用途のみ
- deletion: `ingested_at < now - 30 days`

### Other boundaries

Product Evidenceへ保存しない:

- client IP
- User-Agent
- raw consultation
- name / email / phone / address
- raw prompt / model response
- auth identifier
- arbitrary headers / unknown fields

Provider/platform access logsはProduct Evidenceとは別扱い。provision時にPrivacy reviewを要求する。

## 4. Safety

### Review

Operational Evidence化でhigh-risk dataの収集範囲が拡大していないか確認した。

### Result

Blockerなし。

- session-only
- no cross-session visitor identity
- no free-text consultation
- no prompt/response persistence
- no pricing / payment / high-stakes automation
- AI Agentへraw DB credentialを付与しない
- Accepted LearningはHuman-onlyのまま

## 5. Analytics

### Review

Metric定義とEvidence source readinessを混同していないか確認した。

### Result

以下を維持:

```yaml
metric:reading_flow_completion: partial
metric:helpful_feedback_rate: partial
```

DB / Vercel projectを作るだけでは`observable`へ上げない。

必要:

- Product event emit
- server-side validation
- persistent Evidence
- reproducible query/export
- retention/deletion
- shared surface E2E
- Data Quality review

`Provisioned != Observable`を正本へ追加済み。

## 6. QA / Eval

### Blocking finding — gate / blocker inconsistency

将来全Evidence条件が満たされても`blocking_issues`が残ったまま`operational`にできる余地があった。

### Fix

CIで:

- derived operational → `blocking_issues.length === 0`
- derived blocked → `blocking_issues.length > 0`

を必須化。

### Additional checks

- one event / request
- request <= 16 KiB
- exact server validation function contract
- no browser direct DB write
- session-only identity
- verification flagにはref必須
- storage provisionにはprovider compatibility ref必須

## 7. Delivery / Cost

### Blocking finding — public endpoint abuse / spend

`/api/telemetry`は匿名browserから到達するため、schema validationだけでは不要request / DB write costの制御にならない。

### Fix

Contractへ追加:

- one event/request
- max 16 KiB/request
- abuse/cost control required
- abuse control verification ref required before Operational Gate
- abuse controlのためにdurable client identityを追加しない
- provider/platform controlを優先候補とする

### Account / cost boundary

現在接続済みVercel TeamはHobby。

Phase Aでは:

- Pro upgradeしない
- Vercel project作成しない
- Neon/Supabase resource作成しない
- 課金を開始しない

Paid action / provider final choiceはHuman/account actionとしてPhase Dへ残す。

## Plan updates from review

Original:

```text
Decision
→ Ingestion
→ Storage
→ Provision
→ E2E
```

Updated:

```text
Decision Contract
  + fact/ref-derived readiness
  + provider-neutral compatibility proof
  + ingested_at retention
  + public endpoint cost boundary
→ Provider-neutral ingestion
→ PostgreSQL persistence / deletion
→ Human provider + plan provisioning
→ Shared surface E2E / Privacy / Data Quality
→ Metric observable
→ Actual User Observation / Polish Loop
→ Manual Real Pilot
→ Controlled Autonomy Entry Review
```

## Phase A acceptance criteria

- [x] Runtime direction decided without paid action
- [x] PostgreSQL / DATABASE_URL contract
- [x] Provider-neutral selection boundary
- [x] browser direct DB write prohibited
- [x] session-only identity
- [x] 30-day `ingested_at` retention
- [x] Preview / Production separation policy
- [x] Product fail-open boundary
- [x] public endpoint request / abuse boundary
- [x] fact + verification ref readiness derivation
- [x] blocker consistency validation
- [x] Metric remains partial
- [x] Manual Real Pilot remains blocked
- [x] Controlled Autonomy remains blocked
- [x] 7-perspective review complete

## Residual gates

Not completed by Phase A:

- server telemetry endpoint
- Evidence repository port
- PostgreSQL schema / migration
- local DB integration test
- deletion runbook execution
- Vercel Pro / project provisioning
- DB provider final selection / provisioning
- Preview / Production wiring verification
- public endpoint abuse control implementation
- shared surface E2E
- central Evidence query/export
- Metric observability promotion
- Actual User Observation
- Manual Real Pilot

These are deliberate blockers, not missing claims.
