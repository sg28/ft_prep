## HRC Voice Verification Platform — Program Status Memorandum

**To:** Office of the CEO \
**From:** Snehashis Ghosh, Live Validation & Quality \
**Date:** 12 June 2026 \
**Period under review:** 8–12 June 2026 (the "Period") \
**Classification:** Internal — Program Leadership

### 1. Purpose and basis

This memorandum records the verification status of the HRC Voice Verification platform (the "Platform") as at 12 June 2026. It distinguishes between (a) matters independently verified by the author, (b) statements made by others and not yet independently verified, and (c) the author's assessment and recommendations. Each material statement is attributed to its source.

Sources relied upon: the program issue log (`bugs-06-2026.csv`) and a read-only inspection of the production virtual machine (the "VM") performed by the author on 12 June 2026. Limitations of this inspection are stated in Section 8.

Defined terms: the **IVR Navigator Agent** is the component that navigates Aetna's automated telephone menu; the **Women's Health Agent** ("Emily") is the component that conducts the benefits interview with a live Aetna representative. Both operate within a single outbound call.

### 2. Executive summary

At the start of the Period, calls were not completing, each ending within the first few seconds of connection (verified; Section 3.1). That defect has been corrected and independently verified (Section 3.2). On the most recent clean verification, a two-way call of seven minutes twenty-one seconds completed without error and its transcript was converted into a structured benefits record (verified; Sections 3.2–3.3).

The Platform is not yet established as production-ready. The capability central to the program — the IVR Navigator Agent reaching a live representative and handing the call to the Women's Health Agent — has not been demonstrated on any live call to date (Section 5). On 12 June 2026, the author independently verified that the fix reported for the IVR Navigator Agent is not deployed on the production VM (Section 4). No completed end-to-end verification against Aetna has yet occurred (Section 5).

### 3. Verified findings (independently confirmed by the author)

**3.1 Prior defect.** During 8–9 June, calls terminated approximately 3–4 seconds after connection with no agent audio. Source: issue log BUG-001 (call records CA3daafcb…, CAa40f8d…).

**3.2 Women's Health Agent — defect resolved and verified (BUG-001, BUG-003).** The Women's Health Agent had been ending each call as it began to speak, attributable to a configuration condition in its opening step. Following correction in source and redeployment on 10 June 2026, the author verified two clean live calls — 88.0 seconds (CAca0f9a…) and 441.1 seconds / 7m21s (CA3ab27f…) — each with two-way audio and no protocol errors, and confirmed the deployed code matches source (checksum 420293c1…). Source: issue log BUG-001/BUG-003.

**3.3 Post-call data pipeline — demonstrated on one call.** On the verified call, the transcript was processed and converted into a structured benefits record, the extraction reporting "high" confidence. This is established for that call; it is not represented as a multi-call result. Source: author's verification, 10 June 2026.

**3.4 IVR Navigator Agent — fix not deployed on production (BUG-002).** On 12 June 2026 the author inspected the production VM (read-only) and found the IVR Navigator Agent host running the pre-fix code (checksum fcc54833…, not the corrected a887bbfb…); the container was last started 9 June 2026 with no restarts; and the IVR Navigator Agent had handled no call since 10 June 2026 (its last call, CAfad4f1…, lasted 0.672s and failed with a 1002 protocol error). The sole outbound call observed since 11 June was handled by the Women's Health Agent against the Aetna line +1 800 575 5999 (CAfc4dc8…) and did not engage the IVR Navigator Agent. Source: issue log BUG-002 (12 June verification entry); VM inspection 12 June 2026.

### 4. Reported by engineering — pending independent confirmation

Engineering has reported encouraging progress on the IVR Navigator Agent. The engineering lead advised on 11 June 2026 that the issue was IVR-related and had been addressed, and on 12 June 2026 that outbound calls had been placed successfully. These reports are consistent with active work on the agent and are welcome.

As at the author's read-only inspection on 12 June 2026, that fix is not yet reflected in the deployed code on the production VM (Section 3.4). This most likely reflects a deployment or environment timing difference rather than any issue with the work itself — for example, the change may have been applied in another environment or directly to the hosted agent, which a read-only VM inspection would not capture (Section 8). In other words, the report and the production environment have simply not yet been reconciled.

These items are therefore recorded as reported and awaiting the routine confirmation step — a single live test (Section 6) — after which they can be moved to "verified."

### 5. Principal open item — end-to-end verification

A complete Aetna verification — navigating the automated menu and handing off to a live representative — has not succeeded to date. Two conditions remain (both tracked under BUG-002): (i) per Section 3.4, the corrected IVR Navigator Agent code is not deployed on production; and (ii) the hand-off from the IVR Navigator Agent to the Women's Health Agent has not been exercised on any call — calls to internal or direct numbers bypass the automated menu, so the hand-off can be confirmed only by a live call to Aetna answered by the IVR Navigator Agent. No complete end-to-end verification against Aetna has been performed to date.

### 6. Status ledger

Identifiers and severities correspond exactly to `bugs-06-2026.csv`. Status terms: *Resolved & verified* — corrected and independently confirmed by the author; *Open* — not resolved, or reported resolved but not independently confirmed; *Under investigation* — evidence being gathered; *Monitoring* — no current action, watched for recurrence.

| Ref | Severity | Status | Description |
| --- | --- | --- | --- |
| BUG-001 | Blocker | Resolved & verified | Women's Health Agent was ending every call on opening |
| BUG-002 | High | Open | IVR Navigator Agent fix reported by engineering; 12 Jun VM inspection found it not deployed (pre-fix code; not redeployed since 9 Jun); hand-off never exercised |
| BUG-003 | Blocker | Resolved & verified | Women's Health Agent (live) had diverged from source control |
| BUG-004 | Low | Monitoring | Transient dependency errors during a redeployment window (IVR Navigator Agent host) |
| BUG-005 | Medium | Under investigation | One Women's Health Agent call ended early with a late-call audio drop (recording under review) |
| BUG-006 | Medium | Open | Call failures not surfaced to operators; visible only in server logs (both agents) |

### 7. Risk assessment (author's assessment)

- **Single unproven step.** Establishing production-readiness depends on the IVR-to-Women's-Health hand-off, which is unproven and confirmable only by a live Aetna call.
- **Reliance on unverified reports.** A fix reported complete was found not deployed on production when inspected on 12 June (Section 3.4/4); confirming fixes by test before relying on them is recommended.
- **Validation constraints.** Validation operates with read-only access; deployment and certain diagnostics depend on engineering, extending each cycle.
- **Infrastructure transition.** A parallel infrastructure migration may change system endpoints; live validation should be scheduled so as not to coincide with a cutover.
- **External availability.** Verification against Aetna is possible only during California business hours, Monday–Friday, which constrains the pace of closure.

### 8. Basis, scope, and limitations

This memorandum reflects the state of the Platform as at 12 June 2026 and is subject to change. The author's verification on 12 June 2026 comprised read-only inspection of the production VM (deployed code checksums, container state, and server logs); no changes were made.

The author does not have access to the two third-party platforms used by the Platform — **Twilio** (telephony and call recordings) and **ElevenLabs** (the hosted voice agents and conversation traces). The findings in this memorandum are therefore based on the production VM and its server logs only. Two consequences follow: (i) the author cannot review Twilio call recordings directly, and cannot independently inspect or confirm changes made within the hosted ElevenLabs agents; and (ii) the author therefore cannot exclude a change applied directly to the hosted IVR Navigator Agent — however, no live IVR Navigator Agent call has occurred since 10 June by which any such change could be demonstrated.

The VM operates in zero-retention mode; verbatim call transcripts are not retained on the VM. Quantitative call figures derive from server logs and the issue log identified above.

### 9. Recommendations (for decision)

1. **Approve one controlled live verification against Aetna**, during business hours and using a designated patient record, to exercise and record the IVR-to-Women's-Health hand-off (settles BUG-002 and Section 5).
2. **Adopt independent test confirmation before any fix is represented as complete**, internally and to the client. Pending such confirmation, the IVR Navigator Agent fix is properly described as reported, not verified (BUG-002).
3. **Implement operator-facing failure visibility before scaling call volume** (BUG-006).

*Sources: issue log* `bugs-06-2026.csv`*; author's read-only VM inspection, 12 June 2026.*
*Prepared 12 June 2026 by Snehashis Ghosh, Live Validation & Quality.*