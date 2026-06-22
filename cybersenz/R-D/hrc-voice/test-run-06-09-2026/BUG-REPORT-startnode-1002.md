# Bug Report — Women's Health agent drops every call (START node 1002)

**Date:** 2026-06-09
**Severity:** Blocker (no calls complete — inbound or outbound)
**Reporter:** Snehashis
**Environment:** Production VM `4.149.74.135`, container `hrc-womens-health-agent` (also affects `hrc-provider-agent`)

## Symptom
Inbound test call connects, plays silence, drops ~3–4s after the caller speaks. No agent audio is ever returned.

## Evidence (server logs)
Two inbound calls today, both `from=+13615226664 to=+15105748747`:

| CallSid | Time (UTC) | Duration | Outcome |
|---|---|---|---|
| CA3daafcb2af1ae9d02c40415ac9f1b378 | 16:28:35 | 4.377s | bridge_closed |
| CAa40f8d6c6298841d70b9b1fdd9746a8e | 16:30:37 | 3.355s | bridge_closed |

Bridge connected normally (signed URL OK, `conversation_initiation_metadata` received, first Twilio audio packet sent). Then ElevenLabs closed the socket:

```
websockets.exceptions.ConnectionClosedError: received 1002 (protocol error)
Agent (agent_4301kmdjtc0qftz9j897bpgkhmby), Node (start_node):
START node generated a response after progressing
```

`hrc-provider-agent` (IVR, agent_6201kt40v5xpf6cbnm7at7s3bx41) shows the same 1002 pattern at 16:01 ("The AI agent you are trying to reach appears to be having technical issues").

## Root cause
The Women's Health workflow START node `LISTEN_FOR_GREETING` (agents/Aetna/womens_health/workflow.py:207) is a listen-only node that should transition to `OPENING_INTRODUCTION` on the edge condition *"Representative greets or asks how they can help."* On the live ElevenLabs agent, the START node is **both transitioning AND generating a spoken response in the same turn**, which ElevenLabs rejects with a 1002 protocol error and tears the call down.

This is an ElevenLabs agent-workflow configuration issue, not the bridge code and not the system prompt wording.

## Suggested fix
Make the START node transition-only (no agent response). Either:
- Re-sync the agent from the repo workflow (`scripts/sync_agent.py aetna-womenshealth`) and confirm the live START node carries no prompt/response, OR
- In the ElevenLabs dashboard, ensure the START node does not generate agent output — only the edge to `OPENING_INTRODUCTION` should fire on the rep's greeting.

Confirm the same on the IVR/provider agent.

## Secondary (lower priority)
Post-call extraction is hitting `APITimeoutError` (Azure OpenAI) and retrying — worth a look after the blocker is fixed.

## Verification after fix
Re-run one inbound call to `+15105748747`. Expect: silence on pickup → caller greets → Emily introduces herself (clean handoff, no drop).
