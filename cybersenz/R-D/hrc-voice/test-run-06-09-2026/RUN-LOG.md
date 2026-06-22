# Test Run Log — 2026-06-09

## Goal
Test the **Women's Health agent behavior** (per Rajveer's call this morning — see
`Screen Recording 2026-06-09 at 8.59.37 AM.txt`). Plan was to call the agent
**inbound** (number ending 8747) to evaluate human-likeness and the IVR→Women's
Health switchover, bypassing the dashboard / operating-window restrictions.

## What we did
1. Placed an **inbound call** from my phone (`+13615226664`) to the Women's
   Health number `+15105748747`.
2. Heard **silence on pickup**, then said *"Aetna provider services, how can I
   help?"* — call **dropped after a few seconds**. Repeated once; same result.

## Result: every call drops ~3–4s in ❌
Both inbound attempts connected but were torn down with no agent audio.

## Why (root cause) — confirmed from VM logs
SSH'd to the VM (`ssh azureuser@4.149.74.135`) and read
`docker logs hrc-womens-health-agent`. Both calls:

| CallSid | Time (UTC) | Duration | Outcome |
|---|---|---|---|
| CA3daafcb2af1ae9d02c40415ac9f1b378 | 16:28:35 | 4.377s | bridge_closed |
| CAa40f8d6c6298841d70b9b1fdd9746a8e | 16:30:37 | 3.355s | bridge_closed |

The bridge connected fine (signed URL OK, `conversation_initiation_metadata`
received, first Twilio audio packet sent). Then **ElevenLabs closed the socket**:

```
websockets.exceptions.ConnectionClosedError: received 1002 (protocol error)
Agent (agent_4301kmdjtc0qftz9j897bpgkhmby), Node (start_node):
START node generated a response after progressing
```

The **IVR/provider agent** (`agent_6201kt40v5xpf6cbnm7at7s3bx41`) shows the same
1002 pattern at 16:01 ("...appears to be having technical issues").

**Diagnosis:** the Women's Health workflow START node `LISTEN_FOR_GREETING`
(`agents/Aetna/womens_health/workflow.py:207`) is a listen-only node that should
only *transition* to `OPENING_INTRODUCTION` on the rep's greeting. On the live
ElevenLabs agent it is **both transitioning AND generating a spoken response in
the same turn**, which ElevenLabs rejects with a 1002. So the moment I greeted
the agent (triggering the transition), the call died.

This is an **ElevenLabs agent-workflow config issue**, not the bridge code, not
the prompt wording, and not the test technique. *Not* greeting doesn't help
either — then the agent just sits silent at the START node and never advances.

**This is a hard blocker:** no call (inbound or outbound) completes on either
agent until the START node is fixed. Filed as
`BUG-REPORT-startnode-1002.md` and reported to Rajveer.

## Suggested fix (for Rajveer / Arpit)
Make the START node transition-only (no agent response), then re-sync:
`scripts/sync_agent.py aetna-womenshealth` (and check the IVR agent the same
way). Verify the live START node carries no prompt/output.

## Secondary finding (lower priority)
Post-call **extraction is timing out** — `extraction.client ... APITimeoutError`
(Azure OpenAI), retrying with backoff. Worth a look after the blocker is fixed.

## State for tomorrow
- Blocked on the START-node fix. Once Rajveer re-syncs the agent, **re-run one
  inbound call** to `+15105748747`: expect silence on pickup → I greet → Emily
  introduces herself cleanly, no drop. Then continue the behavior checklist
  (human-likeness, IVR→WH switchover, number readback, "are you an AI", etc.).
- Read-only on the VM only; did not edit or re-sync any agent (production PHI
  system). Temp file holding the SSH password was deleted after use.
