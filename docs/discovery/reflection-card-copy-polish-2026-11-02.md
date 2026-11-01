# TASK — Reflection Card introduction copy polish (2026-11-02 JST)

> Status: narrow **copy-only implementation** for [#59](https://github.com/s977043/uranai-app/issues/59), against app `main@413b6df7f6c6bb3b4286502a771daccafe486a38`.
>
> Evidence level: static source + future CI; **not observed users, not a product experiment result, not a screenshot/browser QA**.

## Problem and decision

The app has six versioned `ReflectionCard` entries selected via a deterministic flow-ID hash in `src/domain/reflectionReading.ts`. It does not draw a tarot deck or ask for a private narrative. Existing visible wording (“今のあなたに向けた一枚” and “一枚ひく”) may imply a personalized tarot reading. This is a **hypothesis from synthetic personas**, not proven user feedback.

**Small reversible fix:** clarify introductory, pre-card and CTA copy as *内省カード* / not a tarot draw. Do not add personal questions/storage, change card/domain/telemetry, or promise improved conversion/helpfulness.

## 三ループ：検証 → レビュー → 修正 → レビュー

These are **three sequential self-review passes**, not independently delegated subagents. No genuine person was interviewed.

### Loop 1 / Intro expectation
- **検証:** Original header describes a single card without naming its type; domain source has six ReflectionCard entries, not a tarot deck.
- **レビュー:** 「一枚」の意味が曖昧で、未来予測や個別鑑定を連想させ得る。
- **修正:** Header says “6種類の内省カードから1枚” and “未来を予測する鑑定ではありません”.
- **再レビュー:** Matches the domain; misleading pre-card heading remains, so continue.

### Loop 2 / Pre-card identity
- **検証:** Pre-card heading says “今のあなたに向けた一枚”, despite only a broad topic being selected.
- **レビュー:** Personalized diagnosis implication remains; tarot/non-tarot boundary is unstated.
- **修正:** Heading becomes “テーマに合わせた内省カード”; description says it is not a tarot draw.
- **再レビュー:** Intro and pre-card now align with actual behavior. Final “一枚ひく” CTA remains ambiguous; continue.

### Loop 3 / Action and regression
- **検証:** CTA still says “一枚ひく” although the card is selected by a flow-ID hash.
- **レビュー:** That language could reinforce a random tarot draw assumption and contradict the explanation.
- **修正:** CTA becomes “内省カードを見る”.
- **再レビュー:** Literal source replacements reverse exactly to the original source. No JS logic, storage, event emission, API, customer data, Agent, model, or paid offer changed. Static source assertions passed. **Exact-head GitHub Actions and visual review still required.**

## Validation boundaries

- [x] Confirmed six fixed ReflectionCards in `src/domain/reflectionReading.ts`; no tarot deck.
- [x] Source diff is only four user-facing copy replacements in `src/app/page.tsx` plus this execution record.
- [x] Static string/inverse-substitution checks passed; current source has no unsupported privacy promise.
- [ ] Exact-head GitHub Actions: lint, typecheck, unit and integration tests, AI eval contracts, build.
- [ ] **Screenshot and visual inspection** at mobile/desktop widths: `AGENTS.md` requires screenshots for UI changes, unavailable in connector-only static audit.
- [ ] Real consented adult observation and repeat observation on revised app; #59 stays OPEN.
- [ ] Human product review of clarity versus ritual/atmosphere tradeoff.

Stop if visual layout breaks, if copy increases confusion, or if users still infer personalized tarot. Revert this PR if needed. No deployment or release authorization.
