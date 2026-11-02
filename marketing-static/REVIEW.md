# Review record — Cloudflare Free static source

Date: 2026-10-22 JST. Source PR: [#52](https://github.com/s977043/uranai-app/pull/52). Tracking: [Issue #50](https://github.com/s977043/uranai-app/issues/50).

## Review independence and authority

Three sequential **role-based review / fix / re-review passes by one assistant**, not separately executed AI subagents or independent third-party attestation. The available ChatGPT GitHub connector permits source/review/PR mutations but offers no subagent worker-dispatch. Human publisher approval remains an explicit, independent future decision. No Cloudflare resource creation, deploy, payment, privacy data ingestion or marketing-publication authorization was performed.

## Baseline

- Cloudflare Free account re-queried read-only on 2026-10-22: 3 pre-existing Pages projects, 0 Worker scripts, 1 existing unrelated D1, 0 KV and 0 Queues. Existing resources stay untouched.
- `uranai-app` main still Next.js 15 / Postgres.js, accepted Vercel Pro + PostgreSQL full runtime ADR.
- `uranai-ai-ops` main includes merged infrastructure #52; current #16 Codex baseline is partial / authenticated inference not demonstrated as restored after latest Oct20 HTTP 401; #50 commercialization remains blocked. This source does not depend on any live model.
- Proposed new source: separate `marketing-static/`, pure static Workers Assets config, no source modification to existing Product Reading or telemetry.

## Loop 1 — Architecture and product

**Verification:** machine-inspect the new static source: explicit `assets.directory` and *no* `main`, only three fixed editorial themes, no model calls, no form/PII/telemetry, index blocked. Strict prototype labeling and non-commercial CTA. 12 source/contract probes reported PASS on authored branch; this is **not** a substitute for `npm run verify`.

**Review finding (medium):** theme controls did not contain `aria-pressed` until JS executed; visitors without JS had no explicit fallback. Usability and accessibility depend unnecessarily on script hydration.

**Fix:** add `aria-pressed="false"` in static markup for every theme and `<noscript>` fallback. Commit `a7203209127522b34005b69f5bebb6826c161cd8`.

**Re-review:** all three buttons have initial semantic toggle state; invalid free-text injection surface still absent; dedicated Node contract test asserts the markup, role and live region. **Design/source PASS, live CDN not tested.**

## Loop 2 — Security / privacy / accessibility

**Verification:** inspect CSP, noindex header and robots, absence of forms/external scripts, storage, network calls, credentials, and use of `textContent` instead of `innerHTML`.

**Review finding (medium):** CSS respected `prefers-reduced-motion`, but the button handler always called `scrollIntoView({behavior:'smooth'})`, creating an accessibility mismatch.

**Fix:** use OS `matchMedia('(prefers-reduced-motion: reduce)')` to select auto vs smooth and add explicit regression assertions. Commits `7e731dd2e476c40a840e33482ab7b9646cc88698` and `cea44cf36706e247d27f344481d615d3ec43a2fa`.

**Re-review:** checks confirm `getSample('__proto__') === null`, only textContent outputs, no persistence/network code, CSP `connect-src 'none'`, `form-action 'none'` and noindex. **Source and security-design PASS; response headers must still be verified after any separately approved deploy.**

## Loop 3 — Reliability / FinOps / launch safety

**Verification:** GitHub [CI 39758828666](https://github.com/s977043/uranai-app/actions/runs/39758828666) completed **success** at commit `cea44cf36706e247d27f344481d615d3ec43a2fa`. The existing CI ran lint, typecheck, Vitest, PostgreSQL integration, AI contracts and build, but **did not run the new marketing-static Node tests**, because CI does not invoke the root `npm run verify`. A successful prior CI run was therefore **insufficient for the new feature**. This was a blocking coverage finding discovered during the third review.

Visual smoke: local offline copies of `index.html` / `styles.css` / `app.mjs` were checked against their Git blob SHAs (`abae5027`, `3f8cb1ee`, `55544012`). Environment policy blocked `file://` and loopback browser navigation, so the exact source was injected via Playwright `page.set_content` and `add_style_tag/add_script_tag` into an isolated Chromium document; this **checks layout and client interactions, not deployment/network/CSP headers**.

- Desktop 1440×1000: 3 selectable themes, click work shows expected fixed question, exactly one pressed state, no console errors, no horizontal overflow: PASS.
- Mobile 390×844: same checks: PASS.
- Exact-source screenshots generated for user review **outside Git**; PR media attachment / independent QA approval remains pending.

**SRE finding:** source-level protections do not guarantee that headers, noindex, real account-scoped Free quotas and isolated hostname work on a deployed URL. **CI coverage finding (HIGH):** `npm run verify` was updated, but the hosted CI calls individual scripts and therefore omitted `npm run test:marketing`. No automatic Worker deployment or unwanted route should occur in a code-only PR.

**Fix:** explicitly add a hosted CI `Marketing static contract` step running `npm run test:marketing` ([commit `34364e0afe016c43f39a064877f89b7e6afcea5d`](https://github.com/s977043/uranai-app/commit/34364e0afe016c43f39a064877f89b7e6afcea5d)); record source-only rollout/rollback gates, stage limitations, account inventory, model cost = zero *for this exact page only*, CDN verification and public-approval conditions. No automatic `wrangler deploy`, credentials or paid/model API added.

**Re-review:** this PR changes only marketing source, documentation, the root verify script and a **required CI test step**; production ADR, Codex evaluation and paid offer remain unchanged. **Source-level design PASS. Hosting/billing/brand/legal and actual Cloudflare deployment: NOT VERIFIED / NOT AUTHORIZED.**

### Final-head CI / merge control

A merge is authorized only if: final-head `npm run verify` is green on the current commit, UI screenshot evidence is available to reviewers, no unresolved required reviewer gate remains, and the user/Human accepts the **source-only** scope. Even if source PR merges, **do not deploy** the static page or activate paid/dynamic features. If any of these prerequisites cannot be verified, keep draft.

## Outstanding evidence and dependencies

- [ ] **Final-head hosted CI that executes `npm run test:marketing`**, plus all existing checks, passing at exact reviewed SHA. Earlier run 39758828666 was green but did **not** execute the new suite.
- [ ] Attach reviewed screenshots to GitHub PR for future collaborators (local snapshot rendered, not yet uploaded).
- [ ] Independent external agent/human review (not claimed).
- [ ] Public launch approval for draft brand/claims/privacy/SEO/worker hostname.
- [ ] Cloudflare Workers Static Assets deployment smoke, CSP HTTP headers and noindex validation on actual isolated environment (requires separate Human approval).
- [ ] Codex baseline #16 and managed app runtime, cost, PSP gates belong to separate Ops/app issues.

**Verdict:** **CONDITIONAL APPROVAL FOR SOURCE DESIGN ONLY**. Neither product release, independent review nor Cloudflare runtime readiness is attested.
