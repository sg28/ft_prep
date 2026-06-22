# Tasks & Notes — CEO Meeting 2026-06-15

**Source recording:** `R-D/ceo-meeting/Screen Recording 2026-06-15 at 8.46.00 AM.{mov,txt}`
**Nature of meeting:** Onboarding + status review. Snehashis (newly joined, part-time)
walking the team through his testing/bug report, plus assignment of his work going forward.

> Transcription is rough; names spelled phonetically are flagged with `(sp?)`.

---

## Participants

- **Gautam** *(Speaker 1)* — CEO / founder. Delegating, onboarding Snehashis, strategic.
- **Snehashis** *(Speaker 2)* — newly joined, limited bandwidth (~part-time, in office
  twice a week). Brought in to add QA/engineering structure. Author of the bug report.
- **Rajvir** *(Speaker 3)* — lead engineer; has effectively built the voice agents solo.
  (Transcribed variously as Rajvi/Rajveer/Rajwit/Rajra/Rajbi — all the same person.)
- **Speaker 4** — near-silent fourth attendee (a few acknowledgements only).

Other people referenced:
- **Arpith** *(sp?)* — did the Azure deployment / CI-CD ("SER") work that Snehashis is to audit.
- **Ananush** *(sp?)* — created three email accounts to be used for the Availity workaround.

---

## Company & product context

- Company is **CyberSense / CyberCare**. Also building an **AI security platform** /
  "secure AI controller" — separately pre-seed funded; Gautam wants Snehashis involved
  there eventually (his testing ability would help).
- Product under discussion: **HIPAA-compliant AI voice agents** for **HRC** (the client),
  calling US health insurers — **Aetna**, **Cigna** ("Signal"), **Blue Cross** — navigating
  IVR, talking to human reps, then producing a **post-call analysis** PDF.
- Gautam & Snehashis have a strong personal connection (known >1 year); Snehashis wants to
  do more with AI. Rajvir & Gautam are "stretched in 20 different directions" — the reason
  for bringing Snehashis in.

### Agents in play
- **Women's Health agent** — working well / "reasonable, good enough."
- **IVR / Navigator agent** — works; hard to test (see notes).
- **Chat agent "Emily 2.0"** *(sp? — "MLE 2.0")* — for **Aetna**; nearly ready for production.

### Tech stack
- **ElevenLabs (11 Labs)** — TTS + STT + orchestration; runs a **"zero attention model"**;
  has its own **ASR API** and some built-in testing (not audio-quality focused).
- **Twilio** — telephony, call audio, number configuration.
- **Azure OpenAI** — **GPT-5.1** (and **GPT-5.5** available) for both the phone call and
  post-call analysis. Chosen for **HIPAA compliance** (see decision below).
- **Redis**, **Docker**, **managed identity** (requires a startup script, not `docker compose`).
- **GitHub Actions** CI/CD (Arpith's work).
- **Post-call analysis pipeline:** data extraction of the chat/call → flatten & normalize
  within the individual chat/voice-agent repo → sent via a **standardized contract** to the
  **upstream dashboard** → **populates a PDF** the client can action against.

---

## Key decisions made in the meeting

1. **Stay on GPT-5.1 / Azure** — Snehashis suggested using cheaper/smaller models per task.
   Rajvir: this is a **compliance** call, not cost. OpenAI on Azure does **not** route to a
   "tertiary server"; e.g. Anthropic-on-AWS goes to a tertiary server they're *not* compliant
   with. GPT-5.1 also handles both the call and the post-call analysis well. GPT-5.5 is a
   possible upgrade later.
2. **Availity account name change** — Blue Cross flagged that the Availity account (and the
   accounts) are in **Rajvir's personal name** (seen on a chat last Friday). Before the chat
   agent goes to production, switch to one of the **three emails Ananush created**, use that
   "other agent" temporarily (~2 weeks), then slowly **reintroduce** ("Edgar" *(sp?)*).
3. **Move to Atlassian (Confluence + Jira)** — stop ad-hoc PDFs. Up to **10 users** available
   (already used heavily for CyberCare / secure AI controller). Create an engineering space +
   **per-customer boards**; build a proper **QA structure and test cases**. Gautam to add
   Snehashis (he's the admin); Rajvir to remind him.
4. **Build a voice-agent evals capability internally** (possibly later as a service) — see
   dedicated section.
5. **Carrier pre-approval handles spam/flagging** — already in progress for **Cigna** (ANI /
   phone number + AI agent going through approval); expected for Aetna "a matter of time."
6. **Recurring meetings** — Friday **9am** (Snehashis's time) HRC-voice product sync; plus the
   company-wide weekly **Wednesday** call (4:30pm Rajvir / **8:30am** Snehashis).

---

## Snehashis — assigned work

### This week (explicitly agreed)
1. **Audit Arpith's Azure deployment / CI-CD ("SER") work.**
   - Gautam asked directly; Rajvir confirmed Snehashis already has **full Azure access**
     ("access to everything").
   - Snehashis has **not** looked at it yet (was focused on the agents).
   - Gautam wanted it "today"; Snehashis asked for **until tomorrow** (supporting a
     production issue since last weekend).
   - Arpith has "one or two minor things left" on the GitHub Actions CI/CD; once done it's
     ready to go to production for testing.
2. **Research voice-agent evals** (the standout new initiative — see below).

### QA / verification backlog (from Snehashis's bug report)
Bugs found while testing; each bug number is cross-referenced in the report (shared by email).
Some fixed, some "under investigation" pending verification.

| # | Item | Status |
|---|------|--------|
| 1 | Women's Health agent — start-of-period calls needed improvements | Fixed / resolved |
| 2 | IVR / Navigator agent | Re-test, verify transcripts, read live logs, then close |
| 3 | Women's Health agent **diverged from source** — fix present in the deployment but maybe **not in the source/codebase** | Verify against last server release |
| 4 | **Transient dependency errors** when moving Navigator agent → Women's Health agent | Needs concrete logs/evidence |
| 5 | **Abrupt call drop** — Women's Health agent went silent mid-conversation for minutes | Rajvir says fixed → verify |
| 6 | **Call failures / Redis unreachable** server-side | Use the **startup script** (managed identity; not `docker compose`) → verify |

Also:
- **Run a full end-to-end Aetna call** — trigger the call, then listen to the recording /
  read the transcript to confirm everything works. Snehashis hasn't done this yet.
- **Verify post-call analysis** (PDF population) — Rajvir says he already fixed and is
  re-running it; Snehashis to test.

### Structural / design work Gautam wants
- Stand up the **QA structure** in Confluence/Jira; build **test cases** per customer.
- Draft the **end-to-end flow / architecture diagram** ("whiteboard mock-up") — **none
  exists today**. Snehashis to draft a baseline for Rajvir to review.
- **Load testing / system design** — unknown Aetna peak-hour call volume; needs to be
  designed "sooner rather than later."
- Define a formal **"success" definition** for a call, and a **rating/scoring metric**
  (per-call, alongside the report) to track agent performance over time. (Distinct from the
  existing "completeness" score — see evals.)
- Apply **HIPAA-grade robustness**: exception / fault / error / graceful handling; decide
  the architecture posture (**fail-open vs. fail-safe**).

### Could help with (offered, lower priority)
- **Code reviews for interns** — Rajvir's single biggest plate item. Snehashis offered to
  share the load; Rajvir would rather he focus on the evals research.

---

## The big new initiative: Voice-Agent Evals

**Goal:** an automated platform to evaluate the **quality of a phone call** — not just whether
the post-call data/PDF was extracted correctly. Today, evaluating a call means manually
listening to 20-/45-minute recordings; the aim is to automate that.

**Why both Snehashis & Rajvir are excited:**
- No "set-in-stone CI/CD" exists for voice agents — this enables **continuous improvement**
  by monitoring real production calls.
- Reusable across **any** future project, not just HRC.
- We have a **plethora of recorded calls** (2–3 min up to 45+ min) — abundant test material.
- Potential **product / service**, but valuable as an internal tool alone.
- Rajvir had this idea ~3 months ago but lost it to bandwidth; "now would be the perfect time."

**What the eval should capture (beyond transcript correctness):**
- Audio / sound **quality** (ASR-based).
- **Gaps** in the conversation.
- A **score**: what went well, what went badly, what can improve.
- The complete **conversation flow** (not just transcript text) — "that's really what's missing."
- Success **and** failure conditions, incl. how the communication is closed.
- "Humanistic" variables — proving we're a **more human** alternative.

**Research directions:**
1. **Benchmark competitor** — an automated-QA-for-voice-agents platform (sounds like
   **"Cekura" / "Secura"** *(sp?)*) that raised **~$2.4M**, is **HIPAA-compliant**, and has
   interesting pricing. It is an **evaluation platform**, not a voice-agent product. They're
   "taboo" about implementation details — and given our HIPAA vertical, the less info we share
   externally the better. Research how they do it (build-vs-buy, pricing).
2. **ElevenLabs ASR route** — likely build our own: upload **Twilio** call audio → 11 Labs
   **ASR** → analysis/scoring. 11 Labs' own testing isn't audio-quality focused, and the
   zero-attention model limits it.
3. **Judge model** — GPT-5.1 / GPT-5.5 on Azure (stay within the HIPAA boundary).

**Note on the broader landscape (from Rajvir):** voice-agent platforms like **Retell AI**
("Retail AI") *(sp?)*, **VAPI**, **LiveKit** ("live care") *(sp?)* are "pedestrian" dashboard
products (prompting + webhooks, usable with **n8n** *(sp?)*). **They all use 11 Labs under the
hood** for voice. We use 11 Labs directly — cheaper, and avoids middleman limits (Retell caps
~**3,500 tokens** before extra charges, and was billing us ~**1.5×** given our verbose prompts),
which is why we moved off them.

---

## Spam / flagging risk (raised by Snehashis)

- If our agents aren't **fault-tolerant**, a competitor building a similar agent could cause
  Aetna to **flag agent voice calls** / treat them as spam, forcing us to intervene.
- Snehashis flagged he hasn't yet looked at **how we handle spam** — to investigate.
- Mitigations today:
  - **Carrier pre-approval** of ANI + AI agent (Cigna in progress, Aetna expected).
  - In the **IVR section** and at conversation start we provide **client + patient
    credentials** that validate us.
  - Reps are often offshore (Philippines); occasional "we don't speak to AI agents" is a
    **personal** stance, not a company-wide mandate.
  - **Logging** to listen back + a **re-queue button** to retry a flagged conversation.

---

## Access & accounts

- **Already has:** full **Azure** access; **secure CRM email** (forwarded to Gmail); **Slack**
  (the "secure cyber sense" workspace).
- **Requested / pending:**
  - **ElevenLabs (11 Labs)** transcript & account access — Rajvir to grant.
  - **Server-side / application** transcript access.
  - Remaining **account credentials** for research.
  - **Confluence** page + per-customer **Jira/Slack** boards — Gautam (admin) to add;
    no HRC-specific Slack board exists yet.
- **Not needed right now:** **Twilio** (only number config, not relevant yet).

---

## Meetings to attend / set up

- **Friday 9am** (Snehashis's time) — HRC-voice product sync; everyone working on HRC voice,
  ~10 min each to share progress. Gives Snehashis visibility + a weekly ownership checkpoint.
  Invite sent to secure CRM email.
- **Wednesday weekly company-wide call** — 4:30pm Rajvir / **8:30am** Snehashis. Gives the
  "411" on everything. Invite to be sent to secure CRM email (may clash with morning).

---

## Open questions / to confirm

- Correct spellings: **Arpith**, **Ananush**, the evals competitor (**Cekura/Secura?**),
  **Retell AI**, **LiveKit**, **n8n**, and "**Edgar**" in the Availity workaround.
- Confirm whether "Rajvi" and "Rajvir" are truly the same person (assumed yes) and who
  Speaker 4 is.
- Exact list of bug numbers and their report cross-references (in the emailed report).
