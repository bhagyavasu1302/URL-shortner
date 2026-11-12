# Blink — interview preparation

## Two-minute project pitch

“I built Blink, a full-stack URL shortener that creates memorable links and gives the owner basic click analytics. The frontend is React with Vite and Tailwind, and it talks to a REST API built with Express. MongoDB stores users, links, and click events.

For code generation I chose cryptographically random seven-character Base62 codes. That gives about 3.5 trillion possible values without revealing link creation order or needing a central sequence. A unique database index is the source of truth for uniqueness, and generated-code collisions are retried. Custom aliases use the same unique index and return a clear conflict if already taken.

Redirects use 302 rather than 301. The destination can be edited or disabled, and a temporary redirect avoids browsers permanently caching an old destination. Each redirect records its timestamp, parsed browser and device, and referrer, without retaining raw IP addresses. The dashboard aggregates those events into daily clicks, top browsers, and referrers.

I also implemented password hashing with bcrypt, expiring JWT access tokens, Zod validation, ownership checks, Helmet, CORS restrictions, and rate limits. I kept Redis out of the first release because cache invalidation for disabled or edited links would add complexity before there is evidence it is needed. The next scaling step would be a short-lived Redis lookup cache with invalidation, followed by shared rate-limit storage and analytics aggregation.”

## 20 likely interview questions and sample answers

1. **Why build a URL shortener?**<br>
   It combines a high-read redirect path, unique identifiers, data modeling, authentication, and analytics in a small product where the trade-offs are easy to demonstrate.

2. **How do you generate codes?**<br>
   I sample seven characters uniformly from a Base62 alphabet using Node's cryptographic random source. The large space makes collisions uncommon, while a unique database index handles them correctly.

3. **Why random codes instead of hashing the original URL?**<br>
   Random codes avoid leaking the destination or producing the same predictable code for the same URL. Hashes need truncation and still need collision handling; they also complicate allowing multiple links to the same destination.

4. **Why not encode an auto-incrementing ID?**<br>
   It is compact and collision-free when the ID allocator is shared, but makes links enumerable and leaks approximate creation volume. It can be a good trade-off for internal systems.

5. **How do you handle a generated-code collision?**<br>
   MongoDB's unique index rejects the duplicate atomically. The service generates another code and retries a bounded number of times. Custom aliases do not retry because the user needs to choose a different name.

6. **Why seven characters?**<br>
   Seven Base62 characters provide roughly 3.52 trillion combinations and are short enough to share. I would revisit length and collision rate using expected creation volume and operational metrics.

7. **Why 302 instead of 301?**<br>
   A 301 can be cached permanently by clients and intermediaries. A 302 lets me change or disable the destination and keeps repeat visits visible to the analytics path.

8. **Why separate Click documents from Url?**<br>
   A growing click array would make URL documents unbounded and expensive to update. Separate events can be indexed by link and time and aggregated without rewriting the link record.

9. **Why are there no raw IPs or country fields?**<br>
   Country requires geolocation and IP processing. I excluded both by default to minimize sensitive data. If added, I would document the provider, retention, and consent/privacy implications.

10. **Why do redirects read more than links are written?**<br>
    A link is typically created once and shared with many people. That makes code lookup latency the hot path and justifies a short-lived cache at scale.

11. **How would you add Redis safely?**<br>
    Cache code-to-destination/state records with a TTL that does not exceed expiry. Invalidate or update entries on edits, disable, and deletion. On cache miss, read MongoDB; keep the DB as authority and monitor hit rate.

12. **How would you scale to millions of links?**<br>
    Run stateless API instances behind a load balancer, use Redis for hot redirect lookups, keep the short-code unique index, add MongoDB read replicas for analytics, and partition/shard after observing read/write distribution and growth.

13. **How do you protect a user's links from another user?**<br>
    Every list query is scoped to the authenticated user, and read/update/delete operations find the requested link by both ID and owner. IDs are not treated as authorization.

14. **How are passwords stored?**<br>
    Only a bcrypt hash is persisted, using 12 rounds. Login compares the submitted password with the hash and returns a generic invalid-credentials message.

15. **What are the JWT trade-offs?**<br>
    A signed, short-lived bearer token makes the API stateless and easy to scale. This demo stores it in localStorage for readability, but an XSS bug can expose it; a production design should consider HttpOnly cookies, CSRF protection, refresh-token rotation, and revocation.

16. **How do you validate URLs?**<br>
    Parse with the platform URL parser, allow only HTTP(S), reject embedded credentials and local/private literal hosts, and block the configured short-link host. This reduces obvious loops and misuse but is not comprehensive phishing detection.

17. **Does this validation prevent SSRF?**<br>
    The server redirects but never fetches the destination, so the redirect endpoint itself is not an SSRF fetcher. A future preview/unfurl feature would need DNS/IP checks, redirect-hop validation, timeouts, and egress controls.

18. **How do you protect the API from abuse?**<br>
    Auth, link-management, and redirect routes have rate limits; input is validated; request bodies are size limited; Helmet and CORS are configured. In a multi-instance deployment I would use shared Redis-backed limits and add abuse monitoring.

19. **What does the unique index guarantee?**<br>
    It serializes competing writes at the database layer, so two requests cannot claim the same code even if they both passed an earlier availability check. The availability check is only a convenience for the UI.

20. **How would you make analytics cheaper at large volume?**<br>
    Keep event writes append-only, aggregate counts into hourly/daily rollups asynchronously, define event retention, and serve common charts from rollups. Replicas or a dedicated analytics store can isolate reporting queries.

## Engineering challenges and how the design addresses them

- **Rare code collisions:** use a unique index and bounded retries, rather than relying on a pre-insert availability query.
- **Editable destinations versus browser caching:** use 302 so link state changes can take effect and repeat clicks can be measured.
- **Analytics growth:** model clicks separately and index by URL and timestamp; do not keep an ever-growing array on the URL.
- **Multi-user privacy:** use an owner field and include it in every URL lookup used by authenticated management endpoints.
- **Balancing safety and scope:** validate URL syntax/protocol, reject local/private literal targets and self-links, but clearly document that reputation checks are not part of this release.
- **Click data minimization:** collect browser, device, referrer, and timestamp without raw IP or country lookup.

## What I would improve with more time

1. Add email verification, password reset, and secure cookie-based sessions with refresh rotation.
2. Use Redis for redirect caching and distributed rate limiting, with invalidation tests.
3. Add a privacy-configurable analytics retention policy and daily click rollups.
4. Introduce link abuse reporting, domain reputation checks, and an admin moderation workflow.
5. Add stronger integration coverage for expiry, ownership boundaries, throttling, and deployment configuration.
6. Add observability: structured logs, request IDs, latency/error metrics, and alerts.
7. Support custom domains and bulk CSV imports with safe limits and per-row error reporting.

## Five-minute live demo

1. **0:00–0:30 — Set context.** Open the home page and explain that users must sign in before creating links; the project is intentionally account-first.
2. **0:30–1:10 — Account flow.** Register or sign in, then point out the protected dashboard and user-specific link list.
3. **1:10–2:00 — Create and customize.** Paste a long HTTPS URL, open customization, check a custom alias, optionally set an expiry, and create the link.
4. **2:00–2:45 — Share it.** Copy the short URL, show the QR code, and scan/open the link in a new tab to demonstrate the 302 destination.
5. **2:45–3:30 — Show controls.** Return to the dashboard, edit the destination, disable and re-enable the link, then explain delete removes its associated events.
6. **3:30–4:20 — Analytics.** Open analytics, show total clicks, daily chart, browser/referrer summaries, and recent click records. Mention that raw IP/country are intentionally absent.
7. **4:20–5:00 — Explain the system.** Walk through the architecture diagram, the unique-index collision guard, and the next scaling step (Redis with invalidation).
