# Cloudflare static experience — isolated source pilot

Tracking: [uranai-app Issue #50](https://github.com/s977043/uranai-app/issues/50), [AI Ops #51](https://github.com/s977043/uranai-ai-ops/issues/51).
Status: **SOURCE ONLY / NOT APPROVED FOR PUBLIC DEPLOYMENT** (reviewed 2026-11-03).

## Product hypothesis and hard limits

The page is a deliberately non-personal editorial reflection-card sample, not a fortune calculation, tarot draw, AI inference, astrological claim or paid offer. Source tests and synthetic browser tests do not establish user retention, paid conversion, or personalized reading quality.

- Three fixed prompts: self/work/relationships. Themes are an explicit allowlist.
- No form, DOB, account, cookie, browser storage, telemetry, external asset, model API, payment or personal input collection in the page.
- No randomness. `app.mjs` changes only textContent within the browser.
- Brand is provisional. Content samples and pricing hypotheses are not approved commercial products.
- Avoid medical/legal/financial advice, certainty, fear-based persuasion and guaranteed outcomes.

## Indexing is NOT access control

HTML and `_headers` request `noindex`; `robots.txt` requests no crawling. These are crawler instructions, **not authentication, confidentiality, or a publication lock**. A disallowed URL may still be indexed, and a crawler blocked from fetching a page cannot see its noindex directive. Do not claim the three files independently guarantee exclusion from search.

The actual boundary in this PR is **no deployment and no deployment workflow**. A future non-public preview requires separately verified access control before an internet-accessible hostname is created. Keep current crawler instructions until a separate launch review decides appropriate crawling/indexing behavior. Never put private material in this static artifact.

Reference: [Google robots.txt limitations](https://developers.google.com/search/docs/crawling-indexing/robots/intro) and [noindex requirements](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## Architecture

```text
marketing-static/public static files
  -> Future separately approved Workers Static Assets host
     (HTML/CSS/module; no Worker main, DB binding or model)

uranai-app/src -> existing Next.js APIs / PostgreSQL ADR unchanged
uranai-ai-ops  -> existing business, safety, model and sales gates unchanged
```

`wrangler.jsonc` is only a source configuration pointing to `./public`, with no main script or runtime bindings. There is no deploy command in CI. Do not infer a free bill or private preview from the existence of this config. Verify current provider eligibility, limits, access logs and pricing before any future resource action.

**Never auto-deploy this PR.** Existing account resources belong to other projects and must not be reused or modified. A future Human-approved deployment must use an explicitly selected project, hostname, audience and access-control policy. A `workers.dev` hostname is not publication authorization.

## Reproducible validation

Local editing: run `bash scripts/setup-lp.sh` from the repository root with Node 22
and npm 11.12.1, then `npm run dev:lp`. Open `http://127.0.0.1:4173`, edit
`marketing-static/public/{index.html,styles.css,app.mjs}`, and reload the browser.
The server reads assets on every request and disables caching; restart after editing `_headers`.
It serves an explicit public-file allowlist on loopback, never the repository root.
Use `LP_PORT=4174 npm run dev:lp` if the default port is occupied.

`npm run test:lp:browser` runs the pinned browser QA, saves screenshots and a receipt
in `.codex-local/lp-evidence/`, and stops its own ephemeral server. Commit LP/QA source
changes locally first: the evidence runner deliberately rejects uncommitted source.
It checks both page-top links and all three theme CTAs at desktop/mobile sizes.
No signup, purchase or external CTA exists in this source. See
[`../docs/codex-development.md`](../docs/codex-development.md) for saved-environment settings.

```bash
node --test marketing-static/tests/*.test.mjs
npm run verify
```

Root verify includes lint/typecheck/Vitest/static tests and all existing AI contract validators. The GitHub CI explicitly executes the static test command as well.

`Static UI smoke` runs real Chromium at 1440×1000 and 390×844 against an ephemeral loopback server, with three theme interactions, keyboard activation, no-JS fallback, storage/network checks, screenshots and a git-SHA receipt. The loopback fixture applies the source `_headers` for local checks. **It is not a Cloudflare emulator and does not prove deployed CDN routing, 404 handling or headers.** QA tools are pinned and installed only in runner temporary storage.

## Separate approval checklist before any public deploy

- [ ] Human approval of product/brand wording and safety review for exact revision.
- [ ] Human chooses project, audience, hostname, publisher, budget and rollback owner.
- [ ] Private preview access control actually verified; noindex alone is insufficient.
- [ ] Mobile/desktop visual evidence, keyboard and assistive-technology review.
- [ ] Real CDN headers, links and 404 behavior checked; provider access-log privacy reviewed.
- [ ] Page-specific indexing/canonical/legal/privacy policy approved; crawling configuration intentionally chosen.
- [ ] Analytics addition reviewed separately; none exists now.
- [ ] Dynamic AI Reader and sales remain off until their independent quality/commercial gates pass.
- [ ] Actual cost and rollback evidence recorded; free-tier claims are not an AI spending cap.

## Rollback

Before deployment, revert the source PR without external side effects. After a separately approved deployment, rollback requires the operator to restore a prior version or disable the hostname and verify the result.
