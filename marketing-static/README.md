# Cloudflare Free static experience — isolated pilot

Tracking: [uranai-app Issue #50](https://github.com/s977043/uranai-app/issues/50), [AI Ops #51](https://github.com/s977043/uranai-ai-ops/issues/51).
Status: **SOURCE ONLY / NOT APPROVED FOR PUBLIC DEPLOYMENT** (2026-10-22).

## Product hypothesis and hard limits

The page is a small, deliberately *non-personal* editorial reflection-card **sample**, not an actual fortune calculation, tarot draw, AI inference, astrological claim or paid offer. It tests whether visitors understand the reflection-first value proposition, not user retention, paid conversion or personalized reading quality.

- Three static human-reviewable prompts: self/work/relationships. Themes are an explicit allowlist.
- No form or PII (including DOB), account, request body, cookie, browser storage, telemetry, external resource, persistent memory, OpenAI API, chargeable request, payment or data collection.
- No randomness. `app.mjs` changes only `textContent` inside the browser.
- Current `index.html`, `robots.txt` and `_headers` independently enforce **noindex**. They must **stay** during source review; remove only as a separately reviewed public launch change.
- Brand is provisional. Do not treat a content sample or ¥1,980 offer hypothesis as an approved published product.
- Content is not advice for health, legal, finance or other consequential matters. Avoid certainty, fear-based persuasion or guaranteed outcomes.

## Infrastructure architecture

```text
marketing-static/public static files
   └── Cloudflare Workers Static Assets (Free, when separately approved)
       └── HTML/CSS/one module (no Worker main, routes or bindings)

uranai-app/src  ── unchanged Next.js 15 APIs / PostgreSQL ADR
uranai-ai-ops   ── unchanged safety / Codex / business gates
```

Cloudflare current guidance favors Workers Static Assets for new static projects; Pages is an alternative. Source: https://developers.cloudflare.com/workers/best-practices/workers-best-practices/ and https://developers.cloudflare.com/workers/static-assets/ .

The static files are a self-contained site and do not require installing Wrangler or modifying the app's Next.js build. The file `wrangler.jsonc` is valid JSON (no comments) and points at `./public`; there is no `main` script. Static assets do not initiate Workers requests or model calls.

**Never auto-deploy from this PR.** The account already has unrelated Pages/D1/zone resources; do not reuse or alter them. A future human-reviewed deployment uses a **new, separate** Worker Static Assets project and a consciously selected hostname/brand. Verify preview isolation and actual HTTP security headers with a live smoke before public promotion. `*.workers.dev` does not imply publication authorization.

## Reproducible validation

```bash
node --test marketing-static/tests/*.test.mjs
npm run verify
```

The first command uses Node's built-in test runner without new dependencies. The root `verify` includes this static validation and existing lint/typecheck/vitest/AI-eval contracts. The minimum Node version is the root repository's Node 22 from `.nvmrc`.

Security/privacy tests: known theme IDs, invalid keys incl prototype pollution attempts, text-only updates, no form/network/storage/third-party dependencies, a11y indicators, CSP/noindex, no Worker/D1/R2 binding.

## Separate approval checklist before any public deploy

- [ ] Brand/product wording reviewed by existing Safety Reviewer with artifact revision and **Human** approval.
- [ ] Human chooses audience, domain and who publishes; no unrelated zone/D1 mutation.
- [ ] Real browser mobile/desktop screenshot, keyboard and assistive tech test; run accessibility audit.
- [ ] CDN live URL headers verified (CSP, referrer, noindex) and asset links/404 behavior checked.
- [ ] Decide which specific pages should be indexed, with canonical URLs and privacy/legal copy. Remove `noindex` only after this decision and production-readiness review.
- [ ] Decide whether/when to enable analytics; no analytics code is included.
- [ ] Keep dynamic API / AI Reader / sale off until AI Ops #16 baseline, Human calibration, #50 PSP suitability and product ADR gates pass.
- [ ] Record actual cost evidence and rollout/rollback references; don't treat Cloudflare Free limits as an LLM spend cap.

## Rollback

For a future approved deployment, restore the prior published Worker version or disable its public hostname; rollback requires separate operator access and evidence. Until initial deployment, simply close this source PR / delete the feature branch (no public effects).
