# Clearance record

**Project:** <name>
**Date established:** <YYYY-MM-DD>
**Tier:** public / internal-safe / restricted

## Answers

**1. Public, internal, or client-confidential?**
> <verbatim>

**2. NDA or employment agreement covering this work? What does it say about portfolios?**
> <verbatim. If unknown, record "unknown" and use Tier 3.>

**3. Who approved a public write-up, and when?**
> <name, role, date, and how: email, Slack, verbal. "Not yet requested" is a valid answer
> and must be carried into the QA phase as outstanding.>

**4. May the company be named?**
> <yes / no / generic description to use instead>

**5. May product screens be shown?**
> <real screens with seeded data / redrawn diagrams only / rebuilt demo only>

**6. Which numbers may be published?**
> <none / relative only / absolutes, and which>

**7. Specific items that must not appear**
> - <customer names>
> - <the X integration>
> - <the unreleased Y feature>
> - <pricing>

## Never-publish list for this project

<!-- Start from the standing list in references/clearance.md, then add the project's
specifics from answer 7. This list is what the QA phase greps against. -->

- Credentials, tokens, connection strings, `.env` values
- Customer and end-user personal data
- Employee names without consent
- Internal hostnames, URLs, bucket and queue names, ticket links
- Revenue, margin, pricing, contract values
- Proprietary logic: <name the specific systems>
- Unreleased: <name>
- <project-specific additions>

## Naming substitutions in force

| Real | Published as |
|---|---|
| <Company> | <"a B2B electronics distributor"> |
| <Product> | <"the internal sales command center"> |
| <Client> | <"an enterprise banking client"> |
| <`internal_table_name`> | <"the main ledger table"> |

## Sign-off

- [ ] Draft sent to <name> on <date>
- [ ] Reply received on <date>: <verbatim or summary>
- [ ] Changes requested and applied: <list>
