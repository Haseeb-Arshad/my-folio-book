# Phase 0: Clearance

Writing publicly about employer work is normal and legitimate. Engineers do it constantly.
What makes it safe is drawing the line between *what you did* and *what the company owns*,
and drawing it before you start writing rather than after you publish.

You are allowed to describe your own skills, decisions, and reasoning. You are not allowed
to disclose the company's confidential information. Those two things are separable in
almost every case, and this phase is where you separate them.

## Ask these questions first

Ask the user directly, in one block, before anything else. Use the AskUserQuestion tool for
the tier question if it is available; otherwise ask in plain text and wait.

1. Is this project public, internal, or client-confidential? Is the product publicly
   launched under a name that can be used?
2. Does an NDA, employment agreement, or contractor agreement cover this work? Have you
   read what it says about portfolios and publicity? If unsure, treat it as covering the
   work and use Tier 3.
3. Has anyone at the company approved a public write-up, and who? Name and date if yes.
4. May the company be named, or should it be described generically ("a B2B electronics
   marketplace")?
5. May the product screens be shown, or only redrawn diagrams and synthetic-data screens?
6. Which numbers may be published: none, relative only ("cut p95 latency 62%"), or
   absolute ("18,000 orders/day")?
7. Is there anything specific you already know must not appear? Customer names, a partner
   integration, an unreleased feature, a pricing model, a security incident?

Record the answers verbatim in `case-study/clearance.md` with the date. That file is the
authority for the rest of the run, and it is also the user's own record if anyone asks
later what basis they published on.

## The three tiers

**Tier 1, Public.** The product ships publicly, the company is happy to be named, and the
UI is visible to anyone on the internet. Publish freely: name the company and product,
screenshot the public surface, link to it. Still redact internal admin tooling, internal
metrics, and anything behind a login that a member of the public cannot see.

**Tier 2, Internal-safe.** The product is real and nameable, but internals are not public.
This is the common case for company work. Publish: your role, the problem class, the
architecture at a block-diagram level you redraw yourself, your decisions and tradeoffs,
relative metrics, screenshots of screens you rebuild with seeded synthetic data. Do not
publish: production data, internal hostnames and URLs, real schema dumps, proprietary
algorithms, internal dashboards with live numbers, anything named after a customer.

**Tier 3, Restricted.** NDA is strict, the client is confidential, or no approval exists.
Publish an anonymized case study: "a logistics platform for an enterprise client",
describe the engineering problem and your solution in generic terms, use only redrawn
diagrams and, if visuals are needed at all, a rebuilt demo with fictional data. No company
name, no product name, no screenshots of the real product. This is still a strong case
study; the engineering reasoning is the valuable part and it survives anonymization intact.

If the answer to question 2 or 3 is uncertain, default to Tier 3 and tell the user plainly
that they can promote it to Tier 2 later with one email to their manager. Promoting is
cheap. Retracting is not.

## Never publish, at any tier

- Credentials of any kind: API keys, tokens, passwords, connection strings, certificates,
  `.env` values, anything that looks like a secret even if it is expired or rotated.
- Customer, client, or end-user personal data: names, emails, phone numbers, addresses,
  order contents, avatars, support tickets, chat transcripts.
- Employee names, photos, or Slack handles without that person's explicit consent.
- Internal hostnames, IPs, private URLs, VPN details, bucket names, queue names, cluster
  names, internal tool links, Jira or Linear ticket URLs.
- Real revenue, margin, unit economics, pricing, contract values, or headcount plans.
- Proprietary algorithms, pricing logic, ranking logic, fraud rules, or trade secrets. You
  may say "I built the scoring service"; you may not publish the scoring rules.
- Unreleased products, roadmap, or anything under embargo.
- Security vulnerabilities, incidents, or their remediation details, unless the company
  has publicly disclosed them.
- Substantial source code the company owns. Short illustrative snippets you wrote, ten to
  twenty lines, that show a pattern rather than the business logic, are the limit; if a
  snippet would help a competitor, rewrite it as pseudocode or a diagram.
- Third-party vendor terms, contract details, or partner names under NDA.

## Rewrites that keep the substance

The engineering content usually survives sanitization. Practice the swap:

| Confidential form | Publishable form |
| --- | --- |
| "Cut the Acme Corp dashboard from 8.2s to 1.4s" | "Cut the heaviest admin dashboard from 8.2s to 1.4s" |
| "Revenue rose from $2.1M to $3.4M" | "The team reported roughly a 60% increase in the metric this surface drove" |
| Screenshot of live orders with customer names | Same screen, seeded with generated names from a demo fixture |
| "The `tenant_billing_ledger` table had no index on `(tenant_id, created_at)`" | "The main ledger table had no composite index on the tenant and time columns the hot query filtered by" |
| "We used Vendor X's API, which rate-limited us at 50 rps" | "The upstream provider capped us well below our peak, so I added a queue and backpressure" |
| "For our client, First National Bank" | "For an enterprise banking client" |

## Sign-off recommendation

For Tier 2 and Tier 3, tell the user to send the finished draft to their manager or the
company's marketing or legal contact with a short note: *here is a portfolio write-up of
work I did, it contains no customer data or secrets, please tell me if anything should
come out*. Then wait for a reply and record it in `clearance.md`. Most companies say yes
in one line, and that one line is what makes the piece safe to publish and safe to talk
about in an interview.

Do not skip this because it feels awkward. A case study the former employer has seen is an
asset. One they discover later is a liability.
