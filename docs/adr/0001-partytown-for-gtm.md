# 1. Run Google Tag Manager via Partytown

## Status

Accepted

## Context

Lighthouse flagged two related performance opportunities, both caused by `gtag.js`
(Google Tag Manager), which was loaded as a plain `<script async src>` plus an inline
bootstrap script in `src/components/BaseHead.astro`:

- **Reduce unused JavaScript** — `gtag.js` transfers 156.3 KiB, of which 67.4 KiB goes
  unused, and Lighthouse ties this to LCP.
- **Preconnect to required origins** — no early connection to `analytics.google.com` /
  `stats.g.doubleclick.net`, which `gtag.js` calls out to.

Two fix approaches for the first issue were considered:

1. **Defer `gtag.js` until `window.load`/idle.** No new dependency, smallest diff, keeps
   the existing inline-script pattern. But it only delays when the cost is paid — the
   same bytes still parse and execute on the main thread, just later.
2. **Run GTM inside a Web Worker via `@astrojs/partytown`.** Removes GTM's JS execution
   from the main thread entirely (not just delays it), which is the standard, documented
   fix for exactly this class of Lighthouse finding. Costs one new dependency and changes
   how the script tags are declared (`type="text/partytown"` instead of a native
   `<script>` type).

## Decision

Adopt `@astrojs/partytown`. Both `gtag.js` and its inline bootstrap in
`src/components/BaseHead.astro` are marked `type="text/partytown"` (kept `is:inline` so
Astro doesn't try to bundle/process them). `astro.config.mjs` registers the integration
with `config.forward: ['dataLayer.push']`, so `gtag()` calls made in the worker are
proxied back onto the real `window.dataLayer` on the main thread.

Preconnect hints were added for the three origins GTM talks to
(`www.googletagmanager.com`, `analytics.google.com`, `stats.g.doubleclick.net`) alongside
this change, since they're only useful once the origins they warm are actually used.

## Consequences

- GTM/GA now depends on Partytown's worker + service-worker bootstrap
  (`~partytown/*.js`, emitted to `dist/` at build time by the integration). If GTM stops
  firing, check the worker (DevTools > Application > Service Workers, or the Partytown
  debug flag) before assuming the main-thread code is at fault.
- Any *future* GTM/GA trigger that reads from `window` (beyond `dataLayer.push`) needs to
  be added to `config.forward` in `astro.config.mjs`, or it will silently fail inside the
  worker's isolated `window` proxy.
- `is:inline` must stay on both script tags — without it, Astro's own script processing
  pipeline (bundling/dedup) would run on a script it doesn't recognize as JS.
