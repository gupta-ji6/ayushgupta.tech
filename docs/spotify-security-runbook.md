# Spotify security operations runbook

This runbook protects the public Spotify presentation endpoint without placing
Spotify, Netlify, or origin-key secrets in the browser or repository. Complete
the Cloudflare cutover before merging the enforcement pull request.

## Security model

The public page may be copied by visitors; the goal is to expose only the fixed
data already rendered, prevent direct access to the general Spotify API, slow
scraping, and stop requests from bypassing Cloudflare.

- Cloudflare accepts public traffic, restricts methods and bursts, bypasses its
  cache, and overwrites `X-Spotify-Origin-Key` before forwarding the request.
- Netlify validates that origin key, applies a per-domain-and-IP backstop, maps
  fixed resource names to fixed Spotify requests, and returns minimal DTOs.
- Netlify's CDN cache varies on both query parameters and the origin-key header.
  A cached authorized response must not satisfy an unauthenticated direct-origin
  request.
- Spotify remains protected by its OAuth scopes and platform quota. Spotify
  does not document an origin allowlist, referrer restriction, IP allowlist, or
  developer-configurable quota for this use case.

References:

- [Spotify app settings](https://developer.spotify.com/documentation/web-api/concepts/apps)
- [Spotify rate limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)
- [Netlify function rate limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)
- [Netlify cache-key variation](https://docs.netlify.com/build/caching/caching-overview/)
- [Cloudflare rate-limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Cloudflare request-header transforms](https://developers.cloudflare.com/rules/transform/request-header-modification/)

## Secret inventory

Keep these values separate:

| Secret                | Stored in                                                                       | Rotation trigger                                                                             |
| --------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Spotify client secret | Netlify Functions environment                                                   | Suspected compromise                                                                         |
| Spotify refresh token | Netlify Functions environment and password manager                              | Reauthorize before six-month expiry, revocation, or compromise                               |
| Spotify origin key    | Netlify production environment, Cloudflare transform rule, and password manager | Rotation test with refresh-token renewal, or immediately after Cloudflare/Netlify compromise |

Never use the Spotify client secret or refresh token as an origin key. Never put
an origin key in GitHub Actions, a deploy-preview environment, source code,
browser code, command history, issue text, function logs, or response bodies.
`npm run dev` sets `SPOTIFY_LOCAL_DEV_BYPASS=true` for the local process because
Netlify's Astro emulator does not provide a deploy context, while setting
`NETLIFY_DEV` disables that emulator's function routing. Never configure
`SPOTIFY_LOCAL_DEV_BYPASS` in the Netlify dashboard or any deployed environment.

Generate each origin key with a password manager capable of producing at least
256 random bits. If that is unavailable, run `openssl rand -base64 32` in a
private terminal and immediately store the output in the password manager.

## Pre-cutover inventory

1. In Netlify, confirm `ayushgupta.tech` and `www.ayushgupta.tech` are healthy
   production domains and the Netlify certificate is valid.
2. Export the complete existing Netlify DNS/NS1 zone. Save the export and a
   screenshot of the nameservers in the password manager or another private
   operations vault, not this repository.
3. Record every apex and subdomain record, including MX, TXT, CAA, verification,
   redirects, and any records Cloudflare's automatic import misses.
4. Record the registrar's current nameservers as the rollback target:
   `dns1.p01.nsone.net` through `dns4.p01.nsone.net`.
5. Record current TTLs and lower them in advance if the provider permits it.
6. Check the parent-zone DS record with `dig +short ayushgupta.tech DS`.

Read-only DNS checks on 8 August 2026 found the four NS1 nameservers above, two
apex and `www` IPv4 answers, existing GoDaddy mail MX records, SPF and site
verification TXT records, and no DS or CAA record. This is only a point-in-time
cross-check; the exported zone is authoritative and must be reviewed again at
cutover.

### DNSSEC sequence

If a DS record exists at cutover, remove/disable it at the registrar before
changing nameservers and wait until public resolvers no longer return it. A
stale DS record paired with new unsigned nameservers can make the entire domain
unresolvable. After Cloudflare is authoritative and stable, enable Cloudflare
DNSSEC and publish the exact DS values Cloudflare provides at the registrar.
Verify with a validating resolver. If no DS record exists, proceed with the
nameserver change and enable Cloudflare DNSSEC only after the zone is stable.

## Prepare Cloudflare Free

1. Add `ayushgupta.tech` to Cloudflare Free.
2. Compare the imported zone line by line with the private NS1 export. Restore
   all mail and verification records before delegation.
3. For the apex, use Cloudflare's flattened CNAME support and point `@` to
   `apex-loadbalancer.netlify.com`. For `www`, use the exact Netlify
   `*.netlify.app` hostname shown under Netlify **Domain management**. Do not
   preserve transient resolved Netlify IPs as permanent records.
4. Keep the Netlify-facing web records **DNS only** while validating the imported
   zone and Netlify certificate.
5. Change the nameservers at the registrar to the pair assigned by Cloudflare.
6. Wait until Cloudflare reports the zone active and public NS lookups return
   the Cloudflare nameservers.
7. Confirm mail, verification records, the apex redirect behavior, Netlify
   custom-domain health, and the existing Netlify certificate before enabling
   the proxy.
8. Wait for Cloudflare Universal SSL to become active for the apex and `www`.
9. Set Cloudflare SSL/TLS encryption mode to **Full (strict)**. Never use
   **Flexible**. If Netlify needs to renew its certificate and reports a
   validation problem, temporarily switch the web records to DNS only, renew,
   verify, and restore the proxy.
10. Turn the apex and `www` records to **Proxied** and verify the whole site
    before adding enforcement rules.

Netlify's supported external-DNS destination is documented in
[Configure external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/).

## Configure the Spotify endpoint rules

Use this exact path condition for every rule:

```text
http.request.uri.path eq "/api/spotify"
```

### Request-header transform

Create a **Modify Request Header** transform scoped to the path above:

- operation: **Set static** (overwrite, not add-if-missing);
- header: `X-Spotify-Origin-Key`;
- value: the independent 256-bit origin key from the password manager.

Overwriting the header prevents a visitor-supplied value from reaching Netlify.
Never paste the key into a rule description or screenshot.

### Method firewall

Create a WAF custom rule with this expression and block action:

```text
(http.request.uri.path eq "/api/spotify" and http.request.method ne "GET")
```

The function also returns `405` with `Allow: GET`; the edge rule rejects obvious
non-GET traffic before a function invocation.

### Burst rate limit

Create Cloudflare Free's path-based rate rule:

- expression: the exact Spotify path condition;
- characteristic/counting key: source IP;
- threshold: 12 requests in 10 seconds;
- action: block for the selected mitigation period;
- status: `429`;
- content type: `application/json`;
- response body: `{"error":"rate_limited"}`.

Use a short mitigation period supported by the dashboard and record the chosen
value in the private operations notes. The application performs no automatic
retry, so a normal page load remains below this burst threshold.

### Cache and notifications

Create a cache rule for the exact Spotify path with **Cache eligibility: Bypass**.
Netlify remains the only shared cache so its Spotify-aware freshness and
origin-key variation stay authoritative.

Enable Cloudflare dashboard and email security notifications for WAF and rate
events. Do not add Cloudflare credentials to GitHub Actions or Terraform for
this setup.

## Configure Netlify before merging

1. In Netlify environment variables, add
   `SPOTIFY_ORIGIN_KEY_CURRENT` with **Functions** scope and **Production**
   deploy context only.
2. Do not set either origin key for Deploy Previews or branch deploys. Their
   Spotify function must fail closed.
3. Confirm `SPOTIFY_LOCAL_DEV_BYPASS` is absent from every Netlify deploy
   context. It belongs only to the local `npm run dev` process.
4. Leave `SPOTIFY_ORIGIN_KEY_NEXT` unset until a rotation.
5. Trigger a production deploy of the current code. It still ignores the new
   header, which makes this a safe time to finish the Cloudflare cutover.
6. Confirm Cloudflare adds the header by checking that the existing Spotify UI
   remains healthy. Never log the header value to prove this; validate only via
   behavior after enforcement is deployed.

## Merge gate and rollout

Do not merge the enforcement pull request until all pre-merge boxes pass:

- [ ] Cloudflare is authoritative for the zone and Universal SSL is active.
- [ ] Full (strict) succeeds for the apex and `www`.
- [ ] Netlify still reports the custom domains and certificate as healthy.
- [ ] The header transform, GET-only WAF rule, burst limit, and cache bypass are
      enabled on the exact function path.
- [ ] `SPOTIFY_ORIGIN_KEY_CURRENT` is stored in Netlify production only and is
      identical to the Cloudflare transform value.
- [ ] `SPOTIFY_LOCAL_DEV_BYPASS` is not configured in Netlify.
- [ ] The existing production music page and health workflow are healthy
      through Cloudflare.
- [ ] The Netlify deploy log recognizes the code-defined Spotify function rate
      rule: 30 requests per 60 seconds, aggregated by IP and domain. Netlify
      warns that invalid rules may not fail a deploy, so absence from the
      post-processing log is a failed gate.

Then merge the code PR. Enforcement takes effect with the production deploy.

## Post-merge verification

Use bodies only to read the safe `error` category. Do not print request headers,
environment variables, or Netlify function configuration.

1. Request
   `https://ayushgupta.tech/api/spotify?resource=top-tracks&range=short_term`.
   It must return `200` with an array of at most ten public track DTOs.
2. Open `/music`, expand every section, and verify populated, genuine-empty,
   and unavailable states remain distinct. Open a rendered item and confirm it
   goes to the matching Spotify content.
3. Request the same path on the site's direct production `*.netlify.app`
   hostname without the origin header. It must return `403` even after the
   custom-domain response has been cached.
4. Request the Deploy Preview function. It must fail closed because the preview
   has no origin key. The preview music UI should show calm unavailable copy.
5. Try unknown and incompatible inputs (`path`, `limit`, `offset`, duplicate
   `resource`, invalid `range`, and `range` on `now-playing`). Each must return
   `400` without affecting Spotify.
6. Send a non-GET request. Cloudflare should block it; a direct authorized
   function test should return `405` with `Allow: GET`.
7. In a controlled window, send 13 requests inside ten seconds from one IP. The
   13th must receive Cloudflare's JSON `429`. Stop, wait for the configured
   mitigation period, and confirm valid traffic recovers.
8. Separately and carefully confirm more than 30 sustained requests in one
   minute activates Netlify's backstop. Do this once, not as a recurring load
   test, and stop immediately after observing `429`.
9. Manually dispatch the Spotify Health workflow. It must return `200` through
   the custom domain without any GitHub-held origin secret.
10. Search repository changes, browser network details, response bodies,
    GitHub Actions, and function logs for accidental secret disclosure. Search
    for variable names, not secret values.

## Dual-key origin rotation

1. Generate a new independent 256-bit key and store it in the password manager.
2. Set it as `SPOTIFY_ORIGIN_KEY_NEXT` in Netlify production and deploy.
3. Confirm the custom domain still works with Cloudflare's current key. This
   proves both slots are accepted without switching traffic.
4. Overwrite Cloudflare's transform value with the next key.
5. Verify custom-domain success, direct-production-origin rejection, and health
   workflow success.
6. Copy the next key into `SPOTIFY_ORIGIN_KEY_CURRENT` in Netlify production,
   remove `SPOTIFY_ORIGIN_KEY_NEXT`, and deploy.
7. Verify the public music page, API, direct-origin rejection, and health
   workflow again.
8. Delete the old key from the password manager after the verification window.

If Cloudflare or Netlify access is compromised, rotate immediately. Otherwise,
test this sequence alongside the six-month Spotify refresh-token renewal.

## Spotify authorization maintenance

- Remain in Development Mode while this is a one-owner portfolio integration.
  Extended Mode is not an ingress-security control.
- Continue Authorization Code flow. PKCE does not authenticate visitors to this
  server-side proxy.
- Keep only: `user-read-currently-playing`, `user-read-recently-played`,
  `user-top-read`, `user-library-read`, and `playlist-read-private`.
- TODO before the next reauthorization: determine whether a displayed playlist
  requires `playlist-read-collaborative`. If none does, omit that scope from the
  next grant. Scope removal requires reauthorization; code changes alone do not
  reduce an existing grant.
- Record every authorization date privately and renew before six months.
- If Spotify returns a replacement refresh token, use the replacement. A warm
  function instance adopts it in memory, but a rotated value must be persisted
  to the Netlify environment through a controlled operator workflow; never log
  it to recover it.
- Rotate the Spotify client secret only after suspected compromise. It is not
  part of routine refresh-token or origin-key renewal.

## Rollback

### Enforcement failure

Revert the production code deploy to the last version that ignored the origin
header. Leave Cloudflare, DNS, TLS, method blocking, burst limiting, cache bypass,
and header injection in place while diagnosing. The old function safely ignores
the extra header.

### Cloudflare/DNS failure

1. If only a Cloudflare rule is faulty, disable that rule first and keep DNS in
   place.
2. If proxy TLS is faulty, switch the Netlify-facing records to DNS only and
   recheck the Netlify certificate.
3. For a full DNS rollback, restore the private NS1 zone export and registrar
   nameservers recorded before cutover. If Cloudflare DNSSEC was enabled, remove
   its DS record at the registrar before restoring NS1 unless the restored
   provider is already configured for that exact DS record.
4. Wait for authoritative nameserver propagation, then confirm web, mail,
   Netlify custom-domain health, certificate health, and Spotify health.

Do not delete the Cloudflare zone or the private NS1 export until the rollback
window has closed and all post-merge checks have remained healthy.
