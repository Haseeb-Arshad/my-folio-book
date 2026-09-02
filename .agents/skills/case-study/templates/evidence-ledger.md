# Evidence ledger

Every factual sentence in the case study points at a row here. Rows with confidence `low`
do not make it into the case study.

**Author identities used for git filtering:** <name(s) and email(s)>
**Repo:** <path> at commit <sha>, ledger built <YYYY-MM-DD>

## Claims

| # | Claim as it appears in the case study | Source | Confidence |
|---|---|---|---|
| E1 | <exact sentence or its core claim> | <commit sha / file path / PR number / metrics.md#M4 / interview Q3 / research R1> | high / medium / reported |
| E2 | | | |
| E3 | | | |

Confidence values:
- **high** - repo-verified or measured in this session
- **medium** - inferred from code with a reasonable reading
- **reported** - interview only, not independently verified

## Timeline

| Period | What happened | Source |
|---|---|---|
| <2024-03> | <first commits on the ingestion service> | `git log` first commit `abc1234` |
| | | |

## Ownership

| Subsystem | Files | Majority author | Note |
|---|---|---|---|
| <services/ingest> | <24> | <yes, 22 of 24> | <built from scratch> |
| <apps/mobile> | <-> | <no> | <owned by another engineer; I reviewed> |

## Gaps the repo could not fill

<!-- These become the Phase 2 interview questions. Keep the list here after the interview
with the answers linked, so a later reader knows what was inferred versus told. -->

| # | Gap | Resolved by |
|---|---|---|
| G1 | <why the project was funded> | interview Q1 |
| G2 | <production traffic volume> | unresolved, omitted from the case study |

## Raw output

<!-- Paste the git command output that supports the ownership and timeline tables, so the
numbers can be rechecked without re-running everything. -->

```
```
