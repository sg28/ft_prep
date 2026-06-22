# Test Run Log — 2026-06-10

## Goal
Re-test the **Women's Health agent (Emily)** after the START-node fix landed, to
confirm the **BUG-001 1002 blocker** is actually resolved on production — the
calls that dropped ~3–4s in on 2026-06-09 (`test-run-06-09-2026/`). Verify via
the inbound number (ending 8747), and check the post-call pipeline.

## What we did
1. **Read-only VM review** (`ssh azureuser@4.149.74.135`, no edits/deploys) of the
   two voice agents and confirmed the Women's Health container had been
   **redeployed today** with fixed code.
2. Placed an **inbound call** from my phone (`+13615226664`) to the Women's Health
   number `+15105748747` at **3:45 PM PDT**, and had a full conversation with Emily.

## Result: call SUCCEEDED — no drop ✅
First clean end-to-end call after two days of ❌.

| CallSid | Connected (PDT / UTC) | Ended (PDT / UTC) | Duration | Outcome |
|---|---|---|---|---|
| CA3ab27f72f181077edb4ebc29562bfb13 | 3:46:49 PM / 22:46:49 | 3:54:11 PM / 22:54:11 | **441.1s (~7m21s)** | bridge_closed (clean) |

Lifecycle from VM logs (`hrc-womens-health-agent`): `Inbound call received` →
`Twilio stream started` → `ElevenLabs conversation started` → **`First ElevenLabs
audio packet sent to Twilio`** (Emily spoke) → `user_transcript` received (two-way,
22,061 audio packets) → clean `WebSocket bridge closed`. **Zero 1002 errors.** An
earlier same-day call (`CAca0f9a…`, 88.0s, 17:04 UTC) was also clean.

## Why it worked (root cause of the fix) — confirmed from VM
The Women's Health container was **redeployed 2026-06-10T17:01:44 UTC**. Deployed
`agents/Aetna/womens_health/workflow.py` md5 = `420293c1ec15447aa9afb29b07ee1c06`
= the fixed repo code (the old buggy version was `1fd70c6586effbb279d0acefd1a652a5`,
unchanged since 2026-06-04). The START node `LISTEN_FOR_GREETING` is now
**transition-only** (`type=start`, edge-only, no `conversation_config`/prompt), so
it no longer "transitions AND speaks in the same turn" — which is exactly what
ElevenLabs rejected with the 1002 on 06-09. Reinforced at the prompt level by
`prompt.md` line 171 (silent workflow progression on the first turn).

**BUG-001 (and BUG-003 dashboard-divergence) verified FIXED.** See `bugs/bugs.csv`.

## BUG-002 still OPEN — IVR / Provider agent not redeployed
The `hrc-provider-agent` container was **not** redeployed (started
2026-06-09T17:38:54 UTC, ~17h before the fix commit `b72cf5d` was authored at
10:53 UTC). Its running IVR workflow `agents/Aetna/ivr/workflow.py` md5
`fcc54833672ac0abaca7ea9886fda70c` is the **old buggy** version (start node still
`LISTEN_FOR_GREETING` with LLM-evaluated edges), vs the fixed local md5
`a887bbfbb4239975e7624290b0cea24a` (bare `CALL_START` start node). This is a
**deploy gap, not a code gap** — the proven fix just needs to be re-synced to the
ElevenLabs IVR agent + the container rebuilt. No test can close it; only a redeploy
will.

> **We never connected to the IVR/Provider agent — not once this session.** All of
> our calls (7-min inbound, ~10-min outbound, earlier 88s outbound) routed to
> **Emily/WH**; the provider container showed **zero** activity for every one. The
> only call that touched it all day was `CAfad4f1…` (08:09 UTC / 1:09 AM PDT) — and
> that was **not** ours (job-fired) and died at **0.672s** with the 1002 before any
> conversation. So **no successful connection to this agent has ever been
> observed** — it cannot be confirmed fixed until it is redeployed AND tested with a
> real-IVR (Aetna) call (own-cell/direct numbers bypass it and reach Emily).

## Post-call pipeline — works end-to-end ✅
`post_call_transcription` webhook received → inbound extraction ran (GPT-5.1,
`confidence=high`, `coverage_path=C_full`, 1 attempt). Stored as structured JSON:
`/app/data/extractions/conv_4501ktsvf29vea08dw7fkjmj6xy4.json` (+ Redis key
`inbound_test:conv_4501ktsvf29vea08dw7fkjmj6xy4:extraction`, 7-day TTL).

### Conversation recap (from extraction `call_notes` — NOT verbatim)
Coverage confirmed active by context (rep didn't say "active" but proceeded). Rep
gave a blanket *"It covers everything,"* and answered *"No"* to exclusions — but
specific procedures were then taken as authoritative: **IVF (58970) & GIFT** = has
exclusion + needs prior auth; **elective egg freezing (58970/89337)** = not
covered; **assisted hatching (89253), embryo transfer (58974), initial cryo
(89258)** = need prior auth; **IUI (58322), sperm prep (89260/89261), TESA/MESA,
ZIFT, ICSI** = covered. **The rep ended the call early** — *"I would like to hang
up right now"* — so thawing, attempt limits, and pharmacy were never reached.

> **Transcript note:** the agent runs in `zero_retention_mode`, so the VM does
> **not** persist the word-for-word transcript — only the structured extraction +
> `call_notes` above. The **verbatim transcript is only in ElevenLabs**
> (conversation `conv_4501ktsvf29vea08dw7fkjmj6xy4`; EL dashboard access still
> pending per TASK-01 §0.4). The Twilio **recording** is also available.

## Secondary finding — BUG-004 (low): transient Redis on provider
`hrc-provider-agent` logged 14× `Readiness check failed — Redis unreachable …
Temporary failure in name resolution` between 09:16–17:01 UTC; **none since** the
17:01 redeploy. Config verified correct (same network, `REDIS_HOST=redis` matches
the redis alias, resolves fine now). Transient, not a config bug — monitor.

## Second test (later, ~00:43 UTC / 5:43 PM PDT 06-10) — OUTBOUND to own phone
Fired an **outbound** call from the dashboard (Henry Lee CSV, `to_number` = my
phone) via the manual **"Start verification"** top button (works off-hours, per
Rajveer). Goal was to test the **IVR/Provider agent (BUG-002)**.

### Key routing learning — this did NOT test BUG-002
Dialing **my own cell** has no IVR to navigate, so the system connected **Emily
(WH) directly** and **bypassed the IVR/Provider agent entirely**. Logs confirm: the
call ran on `hrc-womens-health-agent` (gpt-5.1 womens_health conversation); the
`hrc-provider-agent` showed **zero** activity. **To actually exercise BUG-002 we
must dial a destination that presents an IVR** (real Aetna's line) — own-cell /
direct numbers always route straight to Emily.

### Result — Outbound → Emily WORKS, but the call ended abnormally
- Call `CA3d664aae4e418777bc4ba3386ab44782` (conv `conv_2001ktt23y2nefjbnr1xy2k0mcff`),
  job `f50fd9cc`, 00:43:05 → 00:52:53 UTC, **duration 588s (~9m48s)**, recording
  `RE994bcb10025b868bb6abfd93498ad8d4` (623s).
- **Conversation logic ran healthy the entire call:** 54 gpt-5.1 LLM-proxy turns,
  **all `200 OK`**, latency ~0.7–2s, `msg_count` climbed **2 → 71** (~35 turns),
  last turn 00:52:33 — i.e. **no stall, no timeouts, no LLM errors**.
- **BUT the call ended with `code=1006`** (abnormal WebSocket close) at 00:52:53,
  ~20s after the last agent turn — NOT a clean close. I (the tester) did **not**
  hang up; I heard **no audio from Emily for the last few minutes, then the call
  dropped**. The clean inbound call earlier ended the opposite way (I hung up →
  Twilio closed normally, no 1006).
- Note: the earlier worry about "130 audio packets" is a **red herring** — that
  counter counts ElevenLabs audio *chunks* (whole utterances), not 20ms frames;
  130 chunks over ~35 turns is normal (`server/websocket.py:94`).

### Is it a bug? UNCONFIRMED from logs — recording needed (tracked as BUG-005)
Two possibilities the logs can't separate: (a) benign — conversation wound down,
Emily ran her silence-handling and ended, but EL tore down ungracefully (1006); or
(b) real — Emily's **audio stopped reaching me** late in the call while her LLM kept
generating. My lived experience (dead air) leans (b), but conflicts with the LLM
being active until 20s before close. **The recording `RE994bcb…` is the deciding
evidence** — listen to the last ~2–3 min. Logged as **BUG-005 (investigating)** in
`bugs/bugs.csv`; do not call it a confirmed defect until the recording is reviewed.

## State for tomorrow
- **BUG-002 still UNRESOLVED and UNTESTED by us.** It needs a **provider/IVR
  redeploy** (Rajveer/Arpit). Note: testing it requires dialing an **IVR
  destination** (real Aetna), not an own-cell number — those route to Emily and
  skip the provider agent. After redeploy, re-test and expect the 1002 to clear.
- **BUG-005 (new, investigating):** review recording `RE994bcb…` to decide whether
  the outbound 1006 / dead-air ending is a real audio-delivery bug or just an
  unclean teardown.
- **Conversation quality** of both calls not scored from text (no verbatim on VM,
  `zero_retention_mode`). Pull recordings or the ElevenLabs convos to score the
  TASK-01 §3.2 checklist.
- Tier 2 (real-Aetna call) still pending — today was a dummy self-test.
- Read-only on the VM only; no edits, deploys, or re-syncs. Temp credential helper
  deleted after use.
