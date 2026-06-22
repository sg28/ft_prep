# Knowledge Transfer — HRC Voice Agents

**Author:** Snehashis Ghosh
**Date:** 2026-06-06
**Status:** DRAFT for review with Rajveer
**Source:** Grounded in a full read of `cybersenz/HRC-Voice-Agents` @ branch
`feature-aetna-ivr-agent` (commit state as of 2026-05-30). File:line references
are included so any claim can be checked against code.

> ⚠️ This document **corrects** the older `r&d/hrc-voice/ARCHITECTURE.md` notes,
> which described a *two-outbound-call* design. The actual code runs **one
> outbound call** (see §3). Where they conflict, this doc (read from source) wins.

---

## 1. What the system does (one paragraph)

A HIPAA-compliant voice-AI that automates **fertility insurance benefit
verification** with Aetna. The dashboard (HRC-Outbound-WebApp) creates a job; the
voice agent places **one outbound phone call** via Twilio. That call is answered
by an **ElevenLabs IVR Navigator** agent that keypads through Aetna's automated
phone tree (Tax ID, member ID, DOB) and, once it reaches a live rep, **transfers
in-call** to the **Women's Health agent ("Emily A.")**, which runs the fertility
benefits interview (25 CPT codes). After the call, **Azure OpenAI** extracts
structured JSON from the transcript, completeness is scored, and the job ends as
`ready_for_pdf` / `needs_review` / `no_coverage` / `failed`. A signed HMAC
callback (no PHI) notifies the dashboard.

---

## 2. The platform (three repos)

| Repository | Role |
|---|---|
| **HRC-Voice-Agents** | This KT — outbound voice verification (FastAPI + Twilio + ElevenLabs + Azure OpenAI). |
| **HRC-Outbound-WebApp** | Dashboard + API orchestration; triggers jobs, shows recordings/PDFs/data. |
| **HRC-Chat-Agent** | Chat-based payer verification (Playwright + Azure OpenAI). |

Deployment (`docker-compose.yml`): **two identical images, different
`AGENT_ROLE`** — `provider` (host :8001) and `womens-health` (host :8002) — plus a
shared **TLS Redis**. Both images are the same app; the role only changes which
webhook secret and a few role secrets are used. All secrets load from **Azure Key
Vault** at startup; the app is **fail-closed** (refuses to boot if a required
secret is missing — `server/app.py:146-160`).

---

## 3. ⭐ The single most important architectural fact

**The system places ONE outbound call, not two.** This is the biggest correction
vs. the old notes.

- `orchestration/launcher.py:39` — "fire **one WH call**".
- `orchestration/launcher.py:103` — `call_sids = {"provider_line": None}`; the
  provider line is never dialed.
- `orchestration/jobs.py:200-207` — the `provider_line` job leg is created with
  `status: "skipped"`, reason `provider_line_voice_call_removed_pending_availity_api`.
- The old separate "provider/general-benefits" voice call was **removed**; general
  benefits are expected to come later from an **Availity API** (not built yet).

> **Why it was removed (from Rajveer, KT call 2026-06-08):** the original design
> used **two phone lines** (provider line + women's-health line). The provider line
> gathered most of the general benefits, but when the conversation reached the
> **Assisted Reproductive Technology (ART)** section, the rep would transfer the
> call to the women's-health line — and that **transfer kept dropping the call /
> corrupting the agent**, hurting accuracy. So HRC chose to **split the work**:
> gather general benefits **manually via Aetna's portal**, and use the **phone call
> only for the ART data** (IVF, IUI, GIFT, ZIFT, ICSI, cryo/thaw, donor, PGT-A,
> storage…) that the portal can't provide. The agent's job is to "tick the boxes"
> on HRC's benefits PDF that the portal can't answer. An **API (Availity-style)** is
> being pursued to eventually cover the rest. This isn't replacing reps — it's
> reducing their phone time.

### So where does the IVR Navigator fit?
The single call's **agent_id is chosen by `config/payer_directory.py:44-56`**:

```
get_agent_id_for_payer(payer="Aetna"):
    if ELEVENLABS_AETNA_IVR_AGENT_ID is set AND IVR not disabled:
        return the IVR agent id        # call dials IVR Navigator first
    else:
        return the Women's Health agent id   # call dials WH directly
```

- If the IVR agent is configured (and `DISABLE_IVR_NAVIGATION` /
  `DISABLE_IVR_AETNA` are not `true`), the **one call dials the IVR Navigator**,
  which **transfers in-call to the WH agent** via ElevenLabs' `transfer_to_agent`
  tool (registry: `config/agent_registry.py:54`,
  `transfer_to_setting="elevenlabs_aetna_womenshealth_agent_id"`).
- The whole thing is tracked as the **single `womens_health` job leg**. Both the
  IVR and WH agent IDs resolve back to that leg
  (`config/payer_directory.py:65-85` `resolve_payer_from_agent_id`).
- **IVR is opt-in**: `ELEVENLABS_AETNA_IVR_AGENT_ID` is *not* in the fail-closed
  required list (`config/runtime_env.py:60-74`), so the app runs WH-only if it
  isn't set.

> Net effect: "dual-agent" = **two ElevenLabs agents inside one Twilio call**,
> connected by an in-call agent-to-agent transfer — *not* two phone calls.

---

## 4. End-to-end flow (code-accurate)

```
(1) Dashboard ── POST /jobs/create (X-API-Key + HMAC) ──► server/routes/calls.py
        guards: verify_api_key + require_dashboard_signature
        DISABLE_OUTBOUND check; idempotency_key → Redis SETNX lock
        → orchestration/jobs.create_job(): encrypt PHI, store job (7-day TTL)
        → background task: launch_verification_calls()

(2) orchestration/launcher.launch_verification_calls()
        resolve WH phone: request override ► PAYER_DIRECTORY (+18005755999) ► fail
        agent_id = get_agent_id_for_payer(...)   # IVR agent if configured, else WH
        _initiate_call(): _get_signed_url(EL) → store_call_context (24h TTL)
            → resolve_caller_id() → Twilio calls.create(.../call/outbound-twiml)
        job.status = in_progress

(3) Twilio dials Aetna → POST /call/outbound-twiml → returns <Stream> TwiML
        → WS /call/stream/{call_sid}  (server/websocket.py)
        bridge: Twilio media (μ-law 8000) ↔ ElevenLabs ConvAI
        captures EL conversation_id → store_conversation_mapping(conv→job)
        IVR agent navigates tree (DTMF) → transfer_to_agent → WH agent talks to rep
        on in-progress: server/routes/status.py starts DUAL-CHANNEL recording

(4) Call ends → Twilio POST /call/status (completed)
        → leg status = twilio_completed_waiting_webhook
        recording-status webhook → recording_url stored on the leg

(5) ElevenLabs ── POST /webhooks/elevenlabs/post-call ──► server/routes/webhooks.py
        Svix HMAC verify (per-role secret); failures → encrypted Redis DLQ; always 200
        agent_id → womens_health leg
        format_transcript → deidentify → extract_womens_health_data (Azure OpenAI)
        restore_from_native (un-redact allowlisted non-PHI)
        score completeness; encrypt extraction; write leg via atomic Lua;
        backup → data/extractions/{conv_id}.json.enc (encrypted)

(6) Lua check (jobs.py:62-67): both_ready when womens_health is
        extracted | extraction_incomplete   (single-leg gate now)

(7) orchestration/merger.check_and_merge()
        SETNX merge lock; decrypt WH extraction
        merged = { fertility_benefits: <WH transcript_extraction> }
        validator.validate_results() runs but cross-call checks are DORMANT
            (they need provider_line data that never exists now — §6)
        outcome:
            wh_outcome ∈ {coverage_terminated, coverage_inactive,
                          no_infertility_coverage} → no_coverage
            extraction incomplete OR any discrepancy                → needs_review
            else                                                    → ready_for_pdf

(8) server/callbacks.notify_dashboard()  (HMAC-signed, 3 retries + jitter → DLQ)
        payload: {job_id, call_job_id, status, has_discrepancies, timestamp, reason}
        NO PHI — dashboard must GET /jobs/{id} for full (decrypted) result
```

---

## 5. Components map (where to look)

| Concern | File(s) |
|---|---|
| App factory, KV load, fail-closed boot, /health[/ready] | `server/app.py` |
| Job create + entry point (API key + HMAC + idempotency) | `server/routes/calls.py` |
| Job state in Redis (PHI encrypt, atomic Lua leg update) | `orchestration/jobs.py` |
| Launch the single call | `orchestration/launcher.py` |
| Which agent the call dials | `config/payer_directory.py` |
| Twilio ↔ ElevenLabs audio bridge | `server/websocket.py` |
| Recording start + status, call status/retry | `server/routes/status.py` |
| Post-call webhook → extraction → merge trigger | `server/routes/webhooks.py` |
| Merge (single-source) + outcome | `orchestration/merger.py` |
| Cross-call validation (dormant legacy) | `orchestration/validator.py` |
| Completeness scoring | `extraction/completeness.py` |
| Azure OpenAI extraction client | `extraction/client.py` |
| WH extraction + 25 CPT keys | `agents/Aetna/womens_health/extraction.py` |
| IVR workflow graph | `agents/Aetna/ivr/workflow.py` |
| Agent personas (prompts) | `agents/Aetna/*/prompt.md` |
| Dashboard callback (HMAC, DLQ) | `server/callbacks.py` |
| Retry (persistent) / stall + missing-webhook recovery | `orchestration/retry.py`, `orchestration/timeout.py` |
| Required secrets / KV contract | `config/runtime_env.py` |
| Settings | `config/settings.py` |

---

## 6. Extraction, completeness & merge (current effective behavior)

- **Extraction** (`extraction/client.py`): Azure OpenAI, `response_format=json_object`,
  `temperature=0.0`, 3 retries. **`max_completion_tokens=16000` with a comment
  citing "GPT-5.x reasoning"** — i.e. the code is tuned for a **GPT-5.x** model,
  even though the README says GPT-4.1. The active deployment name is KV-only —
  **confirm with Rajveer** (open item).
- **De-identification** (`utils/deidentify.py`): the WH path
  (`extract_womens_health_data`) applies only the **base** regex patterns (SSN,
  DOB, email, phone, member-ID, zip). Name-redaction helpers exist
  (`deidentify_transcript_with_context`, `deidentify_with_known_names`) but are
  **not** used in the main WH path — patient/rep names reach Azure OpenAI
  un-redacted (acceptable under Azure OpenAI BAA, but worth confirming).
- **Completeness** (`extraction/completeness.py`, WH): requires `coverage_path`
  (mandatory — null forces incomplete) + `reference_number` + `rep_name` + **≥5 of
  25 procedures** with a non-null `covered`. Pass threshold **≥0.75**. If
  `coverage_path == "not_covered"`, only coverage_path/reference_number/rep_name
  are needed.
- **Merge** (`orchestration/merger.py`): single-source — emits
  `{ fertility_benefits: <WH extraction> }`. The 4 cross-call conflict checks in
  `validator.py` **all early-return empty** because they compare against
  `provider_line` data that no longer exists. They are **dormant legacy code**
  waiting for the Availity provider feed. The only discrepancies that actually
  fire today: `recording_failure`, `extraction_incomplete`.

---

## 7. Job & leg state model (from code)

**Job status:** `pending → in_progress → ready_for_pdf | needs_review |
no_coverage | failed | dead_letter`.

**`womens_health` leg status:** `pending → calling →
twilio_completed_waiting_webhook → extracted | extraction_incomplete`; failure
paths: `failed/busy/no-answer/initiation_failed → retrying → permanently_failed`;
recovery edge: `webhook_missing`.

**`provider_line` leg:** permanently `skipped` (compatibility object only).

Redis keys: `job:{id}` (7d), `call_ctx:{call_sid}` (24h),
`conv:{conversation_id}→job_id` (7d), `idempotency:{key}` (24h),
`merge_lock:{id}`, `webhook_dlq:*`, `callback_dlq:*` (7d).

---

## 8. Security / HIPAA controls

- PHI encrypted at rest with Fernet (`utils/encryption.py`); `PHI_FIELDS` =
  first/last name, DOB, member_id (`orchestration/jobs.py:18`).
- Extraction backups encrypted on disk (`data/extractions/{conv}.json.enc`); no
  plaintext.
- Inbound auth: `/jobs/create` needs `X-API-Key` **and** dashboard HMAC
  (`server/security/dashboard_auth.py`).
- Twilio signature required on every Twilio route (`utils/twilio_validation.py`).
- ElevenLabs webhook verified via Svix `construct_event`; failures → encrypted DLQ;
  endpoint **always returns 200** (so ElevenLabs doesn't auto-disable it).
- WebSocket bridge auth: short-lived signed token in Twilio custom params
  (`utils/websocket_auth.py`).
- Outbound callback HMAC-signed (`utils/hmac_signing.py`), no PHI.
- Audit records (tamper-evident) on every bridge session → Redis → Blob
  (`utils/audit.py`, `utils/audit_export.py`).
- Zero-Retention in-call LLM proxy (`server/routes/llm_proxy.py`) — keeps in-call
  reasoning PHI off retaining LLMs (separate from post-call extraction, which goes
  to Azure OpenAI directly under BAA).

---

## 9. The two agents (behavioral summary)

**IVR Navigator** (`agents/Aetna/ivr/`): ElevenLabs **workflow** agent (graph of
nodes). Stays silent, sends **DTMF only** via `play_keypad_touch_tone`. Tax ID
hardcoded `9 5 4 5 1 0 6 6 7`; member_id/DOB from dynamic vars (DOB MM/DD/YYYY →
8 digits, slashes stripped). Handles 4 known traps (fax offer, benefit-details
menu, ANSI service menu, "are you done" completion question). Transfer triggers:
human voice, hold music, or transfer-confirmation phrase → `transfer_to_agent`.
Failsafe transfer after ~45s+30s of no progress. If asked if it's a robot:
"Yes, I am a virtual assistant." Max duration 600s.

**Women's Health "Emily A."** (`agents/Aetna/womens_health/`): conversational
agent. Verifies infertility benefits across **25 CPT-coded procedures** (IUI, IVF,
ICSI, cryo/thaw, donor, PGT-A, storage, etc. — keys in
`agents/Aetna/womens_health/extraction.py:12-38`). Aetna-specific: checks
**Center/Institute of Excellence** requirement and whether HRC qualifies. Gives
callback `626-204-9699 ext 1304`. Tight conversational discipline (no filler,
minimal acknowledgments) to read naturally to reps and produce clean transcripts.
Max duration 1200s.

---

## 10. ⚠️ Risks / open questions

Updated after the KT call (2026-06-08). Most access blockers are now **cleared**;
the real remaining unknown is the live IVR→WH transfer.

```
[OPEN]    Active Azure OpenAI deployment — code tuned for GPT-5.x
          (max_completion_tokens=16000) but README says GPT-4.1. Azure portal
          access now granted → read AZURE_OPENAI_DEPLOYMENT from Key Vault.
          (Rajveer: GPT-5 family is East US 2 only.)

[RISK]    IVR→WH transfer & conversation_id. websocket.py captures ONE
          conversation_id at init (the IVR agent's). If ElevenLabs' in-call
          transfer creates a NEW conversation_id for the WH portion, the
          post-call webhook for WH could fail to map to the job (→ DLQ).
          Safety net: timeout.check_missing_webhooks polls the EL API. STILL
          the key thing to verify on the first live transfer — this dual-agent
          flow has never completed a live E2E run.

[DE-ID]   WH extraction applies base de-id only (no name redaction in the
          main path). Confirm acceptable under the Azure OpenAI BAA.

[STALE]   README.md describes the OLD two-conversational-agent design.
          docker-compose.yml header says "Inbound-only ... no outbound" but
          sets DISABLE_OUTBOUND=false (outbound IS enabled). Recommend fixing.

RESOLVED in KT call:
  [x] Tax ID 954-510-667 — confirmed company-wide (not per-location).
  [x] Test patient — self-test with DUMMY data (payer=Aetna); real-patient CSV
      coming from Rajveer.
  [x] Azure access — Contributor on HRC + HRC-dev.
  [x] Dashboard walkthrough — done (CSV upload flow).
  [x] "KV-in-exec returns 0" — not a bug: run KV cmds via startup-docker-compose.sh.
```

---

## 11. Operations quick reference

> **KV-backed commands must run via `startup-docker-compose.sh`** (it injects Key
> Vault secrets). Plain `docker exec` / `docker compose` runs without them — that
> was the old "0 settings" false alarm.

- **Health:** `curl http://localhost:8001/health/ready` (provider) /
  `:8002/health/ready` (WH) → `{"status":"ready","redis":"ok"}`.
- **Fire a job:** **dashboard → Call Queue → View Database → Download Template →
  fill CSV (payer=Aetna, E.164 numbers, DOB MM/DD/YYYY full year) → pause the
  autonomous runner → upload → Ready to Call.** (Not via `dry_run.py`/
  `test_outbound.py`, which only carry placeholder data.)
- **Autonomous lanes:** two concurrent call lanes (A/B), scheduled **8:15am–4:30pm
  PST** (best Aetna window; cut off at 4:30 to avoid end-of-day bad info).
- **Rebuild voice agents:** `deploy.sh rebuild` (safe; isolated from other agents).
- **Rebuild dashboard:** `deploy-main.sh` — ⚠️ warn the group chat if run in the
  daytime; it can orphan in-flight jobs / disrupt the chat agent.
- **Agent sync to ElevenLabs:** `scripts/sync_agent.py aetna-ivr` /
  `aetna-womenshealth` (`--dump` to preview); `scripts/sync_all.sh` for both
  (run via `startup-docker-compose.sh`).
- **Compare local vs live agent config:** `scripts/compare_agents.py`.
- **Verify a job:** `scripts/verify_live_job.py <job_id> ...` (via startup script).
- **Twilio cost:** ~0.2¢/min, mostly the call recording — negligible.
- **Get full result:** `GET /jobs/{job_id}` with `X-API-Key` (decrypts legs;
  includes `recording_url` per leg).
- **Stalled/missing-webhook sweep (cron):** `scripts/check_stalled.py`.
- **Replay failed dashboard callbacks:** `scripts/replay_callback_dlq.py`.
- **Caller ID:** `+44` destinations use `TWILIO_TEST_NUMBER` (safe test path);
  WH calls use `TWILIO_WOMENS_HEALTH_NUMBER` (`utils/call_routing.py`).
- **Tests:** 40 test files; `python -m pytest tests/ -v`. (Tests are not the
  gate — a successful **live** call is.)

---

## 12. Required secrets (fail-closed at startup)

`config/runtime_env.py` — base required: `ELEVENLABS_API_KEY`,
`ELEVENLABS_WEBHOOK_SECRET`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`,
`AZURE_OPENAI_DEPLOYMENT`, `ENCRYPTION_KEY`, `TWILIO_ACCOUNT_SID`,
`TWILIO_AUTH_TOKEN`, `LLM_PROXY_AUTH_TOKEN`, `DASHBOARD_CALLBACK_SECRET`,
`WEBSOCKET_AUTH_SECRET`, `APP_BASE_URL`, `INTERNAL_API_KEY`. Plus per-role:
`ELEVENLABS_AGENT_2_ID`, `TWILIO_WOMENS_HEALTH_NUMBER`. **Optional/opt-in:**
`ELEVENLABS_AETNA_IVR_AGENT_ID` (enables the IVR leg), `ELEVENLABS_WEBHOOK_SECRET_WH`,
audit-blob + inbound-HMAC secrets. All live in Key Vault
`outboundhrc.vault.azure.net`.

---

## 13. Migration context (Arpit / HRC-infra)

Two Azure resource groups (you have **Contributor** on both as of 2026-06-08):
- **`HRC`** — the **current production VM** (predecessor); your testing + log
  viewing happen here.
- **`HRC-dev`** — Arpit's in-progress Terraform rebuild: **4× Azure Container Apps**
  migration with managed PostgreSQL + Redis. Will eventually cut over and the old
  `HRC` VM is retired.

GPT-5 models are **East US 2 only** (must stay there). The VM IP and Key Vault may
change post-migration — coordinate timing so a cutover doesn't collide with live
test calls. Details: `r&d/hrc-infra/NOTES.md`,
`r&d/converted-md/HRC_Platform_Migration_Document.md`.

---

*Draft — please review. Highest-value confirmations: §10 model deployment, the
IVR→WH transfer conversation_id behavior on the first live call, and whether the
WH-only-with-in-call-IVR architecture description in §3 matches your intent.*
