# STAR Story 4 — Initiative (Notification Service)

**Maps to:** Do the Right Thing, Excellence

## Full Answer

> **Situation:** We were dependent on a third-party email provider — expensive, with inconsistent deliverability, and a single point of failure with no fallback if it went down.
>
> **Task:** Nobody asked me to fix this — I self-assigned it after noticing the risk.
>
> **Action:** I prototyped an alternative combining Novu (an open-source notification infrastructure) with an internal SMTP setup as a shared service other teams could adopt, rather than each team solving this problem separately. Before asking anyone to switch, I ran it in shadow mode — sending real notifications through the new path in parallel with the old one, without anyone depending on it yet — to validate deliverability and reliability against the incumbent. Once validated, I wrote a migration runbook so other teams could move over with a clear, low-risk path rather than needing me to migrate them by hand.
>
> **Result:** $5K-10K+ in savings, and 4 platforms adopted the new shared service the following quarter.

## Follow-Up Prep (draft answers — adapt with your real specifics)

**"How did you sell it to leadership?"**
> The strongest version of this answer leads with the shadow-mode validation data, not a pitch deck — "here's real deliverability data from running both in parallel" is more persuasive than a projection. Also worth naming the risk-reduction angle explicitly: this wasn't just cost savings, it removed a single point of failure, which is a resilience argument leadership tends to care about independently of cost.

**"What if it had failed in production?"**
> This is exactly what the shadow-mode validation step was for — the answer should make clear that "failed in production" was a risk deliberately minimized *before* asking any other team to depend on it. If pushed further: describe what the rollback path would have looked like (falling back to the incumbent provider, since nothing was decommissioned until the new service proved out) and what specific metric threshold would have triggered that rollback.
