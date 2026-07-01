# STAR Story 2 — Cost Discipline (CMS Migration)

**Maps to:** Excellence, Do the Right Thing

## Full Answer

> **Situation:** We were carrying heavy AEM licensing costs, and content workflows were slow — publishing changes took days, not hours.
>
> **Task:** I led the evaluation of alternatives and the migration itself.
>
> **Action:** Rather than jump straight to a replacement, I evaluated multiple CMS options against our actual requirements before committing — this is the story that backs up the "I default to building, but I've worked on evaluating first" weakness answer. I picked Strapi, then ran a zero-downtime migration rather than a cutover that would have meant a content freeze. I built custom plugins to cover gaps between what Strapi offered out of the box and what our workflows needed, and rolled it out in two phases rather than all at once, so any problems in phase one were caught and fixed before phase two touched more of the business.
>
> **Result:** $100K+ in annual savings, publish times went from days to hours, and there was zero rollback needed across the migration.

## Follow-Up Prep (draft answers — adapt with your real specifics)

**"What other options did you consider and why reject them?"**
> Name the actual alternatives evaluated (e.g. staying on AEM with a cheaper license tier, a different headless CMS, a fully custom-built solution) and the specific dealbreaker for each — cost alone is rarely the full story; usually it's cost combined with a specific gap (e.g. one option lacked a plugin ecosystem, another required a rewrite of the front-end integration). The strength of this answer is in the *specific rejection reasons*, not just "we compared a few and picked the best one."

**"What broke during migration?"**
> Have one real, specific issue ready — something that broke in phase one and was caught before phase two, which is exactly why the phased rollout mattered. A "nothing broke" answer is less credible than "here's the one thing that broke, here's how we caught it early because of the phased approach, and here's what we changed before phase two."

**"Who pushed back?"**
> Likely candidates: whoever owned the AEM relationship/budget, or a team with workflows tightly coupled to AEM-specific features that needed a custom plugin to replicate. Frame the pushback as a legitimate concern you had to actually address (via the custom plugins), not an obstacle you steamrolled.
