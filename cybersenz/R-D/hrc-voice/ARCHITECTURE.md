# HRC-Voice-Agents — Architecture & Module Map

> R&D deep-dive notes. Source repo: `cybersenz/HRC-Voice-Agents`
> Branch: `feature-aetna-ivr-agent` (latest, per Rajveer 2026-05-30)
> Updated 2026-05-30. Read-only analysis — no code was changed.
>
> **⚠️ CORRECTED 2026-06-06 after a full source read.** The original notes claimed
> the system places **two outbound calls** (IVR + WH in parallel). That is WRONG.
> The code places **ONE outbound call** that dials the IVR Navigator, which then
> **transfers in-call** to the Women's Health agent (ElevenLabs agent-to-agent
> transfer). The `provider_line` leg is permanently `skipped`. Sections below are
> fixed. The authoritative, file:line-referenced version is
> **`r&d/hrc-voice/KT-hrc-voice-agents.md`**.

---

## 1. What it is (one paragraph)

A **HIPAA-compliant voice AI system** for fertility insurance verification. For
each patient job it places **ONE outbound phone call** via Twilio. That call is
answered by an **Aetna IVR Navigator** agent that navigates the automated phone
tree (enters Tax ID, member ID, DOB via DTMF tones, handles IVR traps, presses
`0` to reach a live rep), then **transfers in-call** (ElevenLabs
`transfer_to_agent`, *not* a second phone call) to an **Aetna Women's Health**
conversational agent once a human answers. The Women's Health agent ("Emily A.")
runs the full fertility benefits script (25 CPT codes). After the call, **Azure
OpenAI** extracts structured JSON from the transcript. The result is **merged
(single-source — WH fertility benefits only)** and the job ends as
`ready_for_pdf`, `needs_review`, `no_coverage`, or `failed`, with a signed HMAC
callback notifying the dashboard (HRC-Outbound-WebApp).

> **"Dual-agent" = two ElevenLabs agents inside ONE Twilio call,** joined by an
> in-call agent-to-agent transfer. There is only one phone call and one job leg
> (`womens_health`). The `provider_line` leg exists only as a `skipped`
> compatibility object (removed pending future Availity API work).

```
   Dashboard (HRC-Outbound-WebApp)
            │  POST /jobs/create  (X-API-Key + HMAC)
            ▼
   ┌─────────────────────── HRC-Voice-Agents (FastAPI) ────────────────────────┐
   │                                                                            │
   │   ONE outbound Twilio call ──► Twilio ↔ WebSocket ↔ ElevenLabs            │
   │                                                                            │
   │   ┌─── Agent A (in-call): Aetna IVR Navigator ──────────────────────┐    │
   │   │  ElevenLabs WORKFLOW agent (DTMF tool, transfer_to_agent tool)   │    │
   │   │  Navigates IVR: Tax ID → caller type 2 → member ID → DOB → rep   │    │
   │   │  On human voice / hold music ──► transfer_to_agent ──────────┐   │    │
   │   └──────────────────────────────────────────────────────────────┼──┘    │
   │                                                                    ▼       │
   │   ┌─── Agent B (same call): Aetna Women's Health ───────────────────┐    │
   │   │  ElevenLabs CONVERSATIONAL agent (25 CPT codes, full script)     │    │
   │   └──────────────────────────────────────────────────────────────────┘    │
   │                              │  post-call webhook (one conversation)       │
   │                              ▼                                             │
   │              extract (Azure OpenAI) → encrypt → Redis                      │
   │                              │                                             │
   │                   check_and_merge (single-source: WH only)                │
   │                              │                                             │
   │            ready_for_pdf / needs_review / no_coverage / failed             │
   │                              │                                             │
   │                   signed HMAC callback ──────────────────► Dashboard      │
   └────────────────────────────────────────────────────────────────────────────┘
```

> **Key change from `main`:** The old "Provider Line" general-benefits **voice
> call was removed entirely** (not replaced by a second call). The single call now
> dials the IVR Navigator (when `ELEVENLABS_AETNA_IVR_AGENT_ID` is set and IVR is
> not disabled), which hands off in-call to Women's Health. If the IVR agent id is
> not configured, the single call dials the WH agent directly. The Women's Health
> agent is the only one that speaks to a live rep and yields extracted benefits.
>
> **Why the provider line was dropped (Rajveer, KT call 2026-06-08):** the old
> two-line approach (provider line + WH line) kept **dropping the call when the rep
> transferred** from general benefits to the women's-health/ART section, hurting
> accuracy. HRC's fix: gather general benefits **manually via Aetna's portal**, and
> use the phone call **only for the ART data** (IVF, IUI, ICSI, cryo/thaw, donor,
> PGT-A, storage…) the portal can't provide. An **Availity-style API** is being
> pursued for the rest. See `KT-hrc-voice-agents.md` §3 and `TASK-01` §0.5.

---

## 2. External dependencies

```
┌───────────────────────────────────────────────────────────────────────────┐
│ RUNTIME PLATFORM                                                            │
│   Python 3.12  ·  FastAPI + uvicorn[standard] (uvloop)  ·  Docker Compose  │
│   Redis 7.4 (TLS, appendonly) — job state, call context, conv mappings, DLQ │
├───────────────────────────────────────────────────────────────────────────┤
│ TELEPHONY            Twilio (twilio>=9)        outbound calls + media stream │
│ VOICE / CONVAI       ElevenLabs (==2.38.1)     IVR workflow + conv agents   │
│ LLM / EXTRACTION     Azure OpenAI GPT-4.1      transcript → structured JSON  │
│                      (also fronted by an internal LLM proxy, see §6)         │
│ SECRETS              Azure Key Vault           azure-identity / -keyvault    │
│                      via Managed Identity      ALL secrets at runtime        │
│ STORAGE (audit)      Azure Blob Storage        azure-storage-blob, HIPAA ret.│
│ CRYPTO               cryptography (Fernet)     PHI encryption at rest        │
│ HTTP                 httpx[http2], websockets   persistent async clients     │
│ SER/DESER            orjson, pydantic v2, pydantic-settings                  │
└───────────────────────────────────────────────────────────────────────────┘

Local dev also needs: a Redis server, an ngrok tunnel (public HTTPS for
Twilio/ElevenLabs webhooks → APP_BASE_URL), and ElevenLabs agents created via
scripts/create_agents.py (or synced via scripts/sync_agent.py).
```

---

## 3. Deployment topology (docker-compose.yml)

Two **identical images, different `AGENT_ROLE`**, plus a shared TLS Redis.

```
              docker network: hrc-voice-network
   ┌──────────────────────────┐      ┌──────────────────────────┐
   │ provider-agent           │      │ womens-health-agent      │
   │ AGENT_ROLE=provider      │      │ AGENT_ROLE=womens-health │
   │ host :8001 → :8000       │      │ host :8002 → :8000       │
   │ TWILIO +15109013968      │      │ TWILIO +15105748747      │
   │ *also the ORCHESTRATOR*  │      │                          │
   │  creates job + launches  │      │                          │
   │  the ONE outbound call   │      │                          │
   └────────────┬─────────────┘      └────────────┬─────────────┘
                │                                   │
                └──────────────┬────────────────────┘
                               ▼
                    ┌─────────────────────┐   ┌──────────────────────┐
                    │ redis (7.4, TLS)    │◄──│ redis-tls-init       │
                    │ :6379 rediss://     │   │ (alpine, one-shot,   │
                    │ appendonly, 512mb   │   │  generates self-cert)│
                    └─────────────────────┘   └──────────────────────┘

Secrets: KEYVAULT_ENABLED=true, AZURE_KEY_VAULT_URL=…outboundhrc.vault.azure.net
Caller-ID base: https://hrc-outbound.cybersenz.com/{provider|womens-health}
Callback:       https://hrc-outbound.cybersenz.com/api/voice-agent/callback
Test number:    +447360278297 (+44 prefix → UK test caller-ID, safe for test calls)
```

> **Orchestrator note (CORRECTED):** the `provider` container creates the job and
> launches **one** outbound call (`orchestration/launcher.py` — "fire one WH
> call"). It does **not** launch two legs. The single call dials the IVR Navigator
> (when configured), which transfers in-call to Women's Health. The old
> provider-line *voice* call is removed; general benefits are expected later from
> an **Availity API** (`provider_line` leg is `skipped` with reason
> `provider_line_voice_call_removed_pending_availity_api`). The `provider` role
> name is now legacy — `server/app.py:88-97` calls it the "WH-only orchestrator".

---

## 4. Project structure (annotated tree)

```
HRC-Voice-Agents/                     (branch: feature-aetna-ivr-agent)
│
├── server/                           ── FastAPI app + transport layer
│   ├── app.py                        app factory, lifespan: KV secret load,
│   │                                   fail-closed required-secret check,
│   │                                   DNS prewarm, Redis init, /health[/ready]
│   ├── websocket.py                  Twilio media-stream ↔ ElevenLabs ConvAI bridge
│   │                                   (_get_signed_url, bidirectional audio pumps)
│   ├── callbacks.py                  signed dashboard callback sender (job result)
│   ├── security/
│   │   └── dashboard_auth.py         inbound HMAC verify (dashboard→voice-agent)
│   └── routes/
│       ├── calls.py                  POST /jobs/create  ── entry point (API key+HMAC)
│       ├── jobs.py                   GET  /jobs/{id}, admin callback-DLQ size
│       ├── inbound.py                POST /call/inbound  (Twilio inbound test)
│       ├── twiml.py                  POST /call/outbound-twiml (returns <Stream>)
│       ├── status.py                 POST /call/status, recording-status webhooks
│       ├── webhooks.py               POST /webhooks/elevenlabs/post-call  ◄ core
│       ├── transfer.py               POST /call/transfer/{sid} (warm transfer stub,
│       │                               now API-key gated, returns 501)
│       ├── llm_proxy.py              POST /api/v1/llm/chat/completions (ZRM proxy)
│       └── metrics.py                GET  /metrics/summary
│
├── orchestration/                    ── job lifecycle (Redis-backed)
│   ├── jobs.py                       job CRUD, PHI encrypt, atomic Lua leg-update
│   │                                   + "both ready?" check, conv→job mapping
│   ├── launcher.py                   launch_verification_calls(): resolve WH phone,
│   │                                   build agent vars, fire ONE outbound call (SID)
│   ├── merger.py                     check_and_merge(): single-source WH merge (SETNX guard)
│   ├── validator.py                  cross-call conflict checks (4) — DORMANT (no provider data)
│   ├── retry.py                      persistent retry scheduling + processing
│   └── timeout.py                    stalled-job detection → dead_letter
│
├── extraction/                       ── transcript → structured JSON (Azure OpenAI)
│   ├── client.py                     AsyncAzureOpenAI wrapper, retries, json_object,
│   │                                   temperature 0.0, validate_extraction()
│   ├── womens_health.py              WH agent extraction (procedures, representative)
│   ├── transcript.py                 format ElevenLabs transcript arrays → text
│   ├── restoration.py                restore non-PHI fields over-redacted by de-id
│   ├── completeness.py               score whether enough fields were captured (<75% → incomplete)
│   ├── inbound_extractor.py          inbound test-call extraction pipeline
│   ├── inbound_prompts.py            inbound prompts (GPT-5.1, POC mode)
│   └── standalone_runner.py          CLI: run extraction on a saved transcript file
│
├── agents/                           ── per-payer, per-role agent contracts
│   └── Aetna/
│       ├── ivr/                      IVR Navigator agent (NEW on this branch)
│       │   ├── prompt.py             AETNA_IVR_SYSTEM_PROMPT
│       │   ├── prompt.md             human-readable copy
│       │   ├── schema.py             AETNA_IVR_DATA_COLLECTION_SCHEMA
│       │   └── workflow.py           AETNA_IVR_WORKFLOW  ◄ ElevenLabs workflow graph
│       │                               nodes: LISTEN_FOR_GREETING → ENTER_TAX_ID →
│       │                               PRESS_CALLER_TYPE_2 → ENTER_MEMBER_ID →
│       │                               ENTER_DOB → AWAIT_REP_PRESS_ZERO →
│       │                               TRANSFER_TO_CONVERSATIONAL / FAILSAFE paths
│       └── womens_health/            Women's Health conversational agent
│           ├── prompt.py             AETNA_WOMENSHEALTH_SYSTEM_PROMPT
│           ├── prompt.md             human-readable (25 CPT codes, 27 sections)
│           ├── schema.py             AETNA_WOMENSHEALTH_DATA_COLLECTION_SCHEMA
│           └── extraction.py         extraction helpers
│
├── config/
│   ├── agent_registry.py             AGENT_REGISTRY: canonical AgentSpec per (payer,role)
│   │                                   load_agent_module() lazy-imports prompt/schema/workflow
│   │                                   used by create_agents.py + sync_agent.py
│   ├── runtime_env.py                shared required-secret list (startup + preflight scripts
│   │                                   stay in sync via this single source of truth)
│   ├── settings.py                   pydantic-settings (env/KV-backed)
│   ├── constants.py                  INBOUND_TEST_JOB_ID, etc.
│   ├── payer_directory.py            payer → {provider_line, womens_health} phone numbers
│   ├── inbound_defaults.py           inbound routing/test defaults
│   └── redis/generate_tls.sh         self-signed cert generator (compose init)
│
├── core/
│   ├── http_client.py                persistent httpx clients (api + callback)
│   └── kv_client.py                  Azure Key Vault async client
│
├── utils/
│   ├── encryption.py                 PHIEncryptor (Fernet, AES-128-CBC+HMAC)
│   ├── deidentify.py                 regex PHI scrubbing before external calls
│   ├── audit.py / audit_export.py    tamper-evident records → Redis → Blob (HIPAA)
│   ├── hmac_signing.py               outbound HMAC for dashboard callbacks
│   ├── websocket_auth.py             signed short-lived WS tokens
│   ├── twilio_validation.py          Twilio signature dependency
│   ├── call_routing.py               resolve_caller_id (US vs +44 UK test number)
│   ├── sanitize.py                   clean dynamic vars before prompt injection
│   └── alerts.py                     stdout + optional Slack ops alerts
│
├── scripts/
│   ├── create_agents.py              create ElevenLabs agents from AGENT_REGISTRY
│   ├── sync_agent.py                 sync prompt/schema/workflow to existing agent
│   │                                   usage: python scripts/sync_agent.py aetna-ivr
│   │                                          python scripts/sync_agent.py aetna-womenshealth
│   ├── sync_all.sh                   sync both agents in one shot
│   ├── compare_agents.py             diff local registry vs live ElevenLabs config
│   ├── preflight_live.py             validate env/secrets/URLs without placing a call  ◄ run first
│   ├── runtime_loader.py             shared KV loader for standalone scripts
│   ├── dry_run.py                    dry-run job creation
│   ├── test_outbound.py              fire a real /jobs/create E2E job
│   ├── verify_live_job.py            post-run: check Redis state, conv mapping, DLQ absence
│   ├── probe_callback.py             probe dashboard callback signing
│   ├── probe_dashboard_contract.py   verify dashboard callback contract
│   ├── check_stalled.py              sweep + recover stalled jobs (run as cron)
│   ├── replay_callback_dlq.py        replay failed dashboard callbacks
│   ├── export_audit_logs.py          export HIPAA audit records to Blob
│   └── production_validate.sh        full production validation sequence
│
├── deploy/
│   └── systemd/                      systemd timer units for check_stalled + audit_export
│
├── tests/                            ── 269 passing pytest tests (see §8)
├── docs/                             ── ops playbooks + status docs
│   ├── 2026-05-27-production-readiness.md   ◄ most recent — live E2E checklist
│   ├── STATE_OF_UNION.md             full codebase audit (single source of truth)
│   ├── DRY_RUN_PLAYBOOK.md
│   ├── dashboard-integration.md
│   ├── dashboard-settings.md         ElevenLabs dashboard-only settings reference
│   ├── inbound-hmac-rollout.md
│   ├── codec-compatibility.md
│   └── redis-configuration.md
├── audits/                           ── 2026-04-23 live-run trace logs
└── README.md
```

---

## 5. Primary data flow — single outbound call (IVR → in-call transfer → WH)

```
(1) Dashboard ──POST /jobs/create──► routes/calls.py
        guards: verify_api_key (X-API-Key) + require_dashboard_signature (HMAC)
        body: patient PHI, payer_name, optional phone overrides, call_job_id
        DISABLE_OUTBOUND check; idempotency: Redis SETNX lock (24h) on retry
                       │
                       ▼
(2) orchestration/jobs.create_job()
        encrypt PHI fields → store job in Redis (status=pending, 7-day TTL)
        womens_health leg = pending; provider_line leg = SKIPPED (compat only)
        agent_id for the call = get_agent_id_for_payer():
            IVR agent id if set & IVR not disabled, else WH agent id
                       │
                       ▼
(3) orchestration/launcher.launch_verification_calls()  — ONE call only
        resolve WH phone: request override ► PAYER_DIRECTORY (+18005755999) ► fail
        build agent_vars (sanitized dynamic variables)
        _initiate_call("womens_health"):
            _get_signed_url(ElevenLabs) → store_call_context(Redis, 24h TTL)
            → resolve_caller_id() → Twilio calls.create(... /call/outbound-twiml)
        job.status = in_progress    (call_sids["provider_line"] is always None)
                       │
                       ▼
(4) Twilio dials Aetna → /call/outbound-twiml → TwiML <Stream> → WS bridge
                       │
                       ▼
(5) server/websocket.websocket_stream   (the ONE call, Twilio ↔ ElevenLabs ConvAI)
        connects to the dialed agent; captures conversation_id;
        store_conversation_mapping(conv → job)
        IVR Navigator: workflow agent keypads the tree via DTMF
                 → on human voice / hold music: transfer_to_agent → WH agent
        WH agent: conversational, runs 25 CPT-code script with the live rep
        audit record created (phi_accessed=True, zero_retention_mode=True)
                       │
        on in-progress: routes/status.py starts DUAL-CHANNEL recording
        call ends ─────┤  POST /call/status (completed) → leg =
                       │  twilio_completed_waiting_webhook; recording_url stored
                       ▼
(6) ElevenLabs ──POST /webhooks/elevenlabs/post-call──► routes/webhooks.py
        Svix HMAC verify (per-ROLE secret); on failure → encrypted DLQ; always 200
        agent_id → womens_health leg (both IVR & WH ids map here)
        format_transcript() → deidentify → extract_womens_health_data() [Azure OpenAI]
        restore_from_native() (un-redact allowlisted non-PHI)
        score completeness → encrypt extraction → write leg via atomic Lua
        backup: data/extractions/{conv_id}.json.enc (encrypted only, no plaintext)
                       │
                       ▼
(7) Lua script (jobs.py) returns both_ready when:
        womens_health is extracted | extraction_incomplete   (single-leg gate)
                       │  (both_ready)
                       ▼
(8) orchestration/merger.check_and_merge()    — SINGLE-SOURCE merge
        SETNX merge lock (prevents race between the two containers)
        merged = { fertility_benefits: <WH transcript_extraction> }
        validator.validate_results() runs but its 4 cross-call checks are
          DORMANT (they compare against provider_line data that never exists)
        outcome:
          wh_outcome ∈ {coverage_terminated, coverage_inactive,
                        no_infertility_coverage}  ──► no_coverage
          extraction incomplete OR any discrepancy ──► needs_review
          else                                       ──► ready_for_pdf
        (both-fail path → failed; stalled >30min → dead_letter via timeout.py)
                       │
                       ▼
(9) server/callbacks  ──signed HMAC callback──► Dashboard /api/voice-agent/callback
        payload: job_id, call_job_id, status, has_discrepancies, reason (NO PHI)
        3 retries + jitter; failures → encrypted callback DLQ (replayable)
```

### Inbound test path (POC mode)
`routes/inbound.py` (`/call/inbound`) + `INBOUND_TEST_JOB_ID`: a call mapped to
the test job skips the merge/job machinery and runs
`extraction/inbound_extractor.run_inbound_extraction()` (GPT-5.1 prompts),
storing results to Redis. Useful for **isolated agent testing without firing a
real paired job**. Dial in from the registered Twilio test number to use this.

---

## 6. Module dependency graph (internal)

```
                    ┌──────────────────────────────────────┐
                    │ config/                               │
                    │  settings · constants · payer_dir    │
                    │  agent_registry  ◄ NEW               │◄── imported widely
                    │  runtime_env     ◄ NEW               │
                    └──────────────────┬───────────────────┘
                                       │
        ┌──────────────┬───────────────┼──────────────┬──────────────────┐
        ▼              ▼               ▼               ▼                  ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐      ┌──────────┐
   │ core/   │   │ utils/   │   │ agents/  │   │extraction│      │ server/  │
   │ http,kv │   │ crypto,  │   │  Aetna/  │   │ client → │      │ routes,  │
   │         │   │ audit,   │   │  ivr/    │◄──┤  womens  │      │ ws, app  │
   └────┬────┘   │ hmac,    │   │  wh/     │   │          │      └────┬─────┘
        │        │ deid,... │   └──────────┘   └─────┬────┘           │
        │        └────┬─────┘        ▲               │                 │
        │             │              │  load_agent_module()            │
        │             │         agent_registry                         │
        │             │              │                                 │
        ▼             ▼              ▼                ▼                ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │ orchestration/   jobs ◄── launcher ◄── (routes/calls)                  │
   │                  jobs ──► merger ──► validator                          │
   │                  retry (persistent scheduling)  ·  timeout (dead-letter)│
   │   jobs.py is the Redis hub: every layer reads/writes job state here     │
   └────────────────────────────────────────────────────────────────────────┘
                              ▲
                   scripts/ use runtime_loader.py to load KV
                   before reading cached settings (standalone ops)

Key edges:
  routes/calls       → orchestration.launcher, orchestration.jobs
  orchestration.launcher → server.websocket (_get_signed_url), config.payer_directory,
                            utils.sanitize, utils.call_routing, Twilio SDK
  routes/webhooks    → extraction.{womens_health, transcript, restoration},
                       orchestration.jobs, utils.deidentify (→ triggers merger)
  orchestration.merger → orchestration.validator, orchestration.jobs (decrypt)
  scripts/*          → config.runtime_env (shared required-secret list),
                       scripts.runtime_loader (KV loading before settings)
  server.app         → core.kv_client, core.http_client, orchestration.jobs, ALL routers
  extraction.client  → config.settings (Azure OpenAI GPT-4.1)
```

### LLM proxy note
`routes/llm_proxy.py` (`/api/v1/llm/chat/completions`) proxies ElevenLabs to
Azure OpenAI — the **Zero-Retention-Mode "Custom LLM"** path so PHI never hits
a retaining LLM. Caps `max_completion_tokens` via `LLM_PROXY_MAX_COMPLETION_TOKENS`
(default 600). Has streaming fallback to a secondary Azure endpoint.

Two distinct LLM consumers:
- **ElevenLabs agents (live, in-call reasoning)** → via this proxy
- **post-call extraction** → `extraction/client.py` directly to Azure OpenAI

---

## 7. IVR Navigator — key detail (new on this branch)

The IVR Navigator (`agents/Aetna/ivr/workflow.py`) is an ElevenLabs **workflow
agent** (not a conversational agent). It uses a directed graph of nodes and
LLM-evaluated edges to navigate Aetna's automated phone system:

```
LISTEN_FOR_GREETING
    │ IVR asks for Tax ID/NPI
    ▼
ENTER_TAX_ID  →  TAX_ID_RETRY  →  ESCALATE_TO_REP_VIA_SPEECH
    │ IVR proceeds
    ▼
PRESS_CALLER_TYPE_2  (sends DTMF 2)
    │ IVR asks for member ID or DOB
    ├──► ENTER_MEMBER_ID  →  ENTER_DOB
    └──► TRAP_INTERCEPT  (fax offer, benefit menu, ANSI menu, completion question)
              │
              ▼
AWAIT_REP_PRESS_ZERO  →  RETRY_PRESS_ZERO
              │
              ▼ human voice OR hold music
TRANSFER_TO_CONVERSATIONAL  (transfer_to_agent tool → WH agent)

Failsafe exits:
  FAILSAFE_PRESS_ZERO → FAILSAFE_TRANSFER (after 30s silence at any stage)
```

**Tools on IVR agent:** `play_keypad_touch_tone`, `transfer_to_agent`, `end_call`
**Max duration:** 600s (10 min)
**Tax ID digits hardcoded:** `9,5,4,5,1,0,6,6,7` (confirm with Rajveer before live call)
**Handoff:** `transfer_to_agent` points to `elevenlabs_aetna_womenshealth_agent_id`

---

## 8. Security / HIPAA controls (where to look)

```
PHI encryption at rest ........ utils/encryption.py (Fernet)  — PHI_FIELDS in jobs.py
Extraction backups encrypted .. data/extractions/{id}.json.enc  (no plaintext on disk)
Transcript de-identification ... utils/deidentify.py → restoration.py un-redacts non-PHI
Zero-Retention LLM ............. routes/llm_proxy.py (ElevenLabs custom-LLM path)
Audit (tamper-evident) ......... utils/audit.py (SHA-256) → audit_export.py → Blob (90d)
Inbound auth (dashboard) ....... server/security/dashboard_auth.py (HMAC), calls.py API key
Twilio request auth ............ utils/twilio_validation.py (signature dep on every route)
ElevenLabs webhook auth ........ Svix SDK construct_event() in routes/webhooks.py → DLQ
Outbound callback auth ......... utils/hmac_signing.py + server/callbacks.py
WebSocket auth ................. utils/websocket_auth.py (signed 120s token, HMAC)
Fail-closed startup ............ server/app.py _REQUIRED_SECRETS (refuses to boot if missing)
Idempotency race guard ......... Redis SETNX lock on /jobs/create (24h idempotency key)
Transfer route auth ............ X-API-Key gated (was unauthenticated on main, now fixed)
```

---

## 9. How live testing works

Unit tests (269) already pass and cover logic: merge, auth, encryption,
extraction. They do NOT prove call quality. The real validation is live
outbound calls — the AI talking to a real Aetna rep — and that is the primary
testing responsibility for snehashis.

### You do not use your personal phone

The system places the calls, not you. Here is the full picture:

```
You (SSH into Azure VM, run a script)
        │
        ▼
Voice Agent Server (Azure VM, Docker container)
        │  instructs Twilio via REST API
        ▼
Twilio dials Aetna's phone number
        │
        ▼
Aetna's IVR system / live rep picks up
        │
        ▼
ElevenLabs AI agents talk to Aetna (within the ONE call)
  Phase 1: IVR Navigator — navigates phone tree via DTMF tones
  Phase 2 (in-call transfer): Women's Health — converses with live rep, asks CPT questions
        │
        ▼
Call ends → Twilio saves dual-channel recording
         → ElevenLabs posts transcript via webhook
         → Azure OpenAI extracts structured fields
         → Job reaches ready_for_pdf / needs_review / failed
```

You are the person who triggers the job and then evaluates the result.
The AI does all the talking.

### What you physically do

**Step 1 — SSH into the Azure VM and trigger a job:**
```bash
ssh <user>@<vm-ip>
docker exec -it hrc-provider-agent python scripts/test_outbound.py
```

**Step 2 — Watch it happen in real time (separate terminal):**
```bash
./deploy logs
```
You will see log events: `IVR entered Tax ID`, `transfer to WH agent`,
`post-call webhook received`, `extraction complete`, `callback sent`.

**Step 3 — Listen to the Twilio recording afterward:**
```bash
# Get the recording URL from the job result
curl -H "X-API-Key: $INTERNAL_API_KEY" \
  https://hrc-outbound.cybersenz.com/jobs/<job_id>
# Look for recording_url inside provider_line and womens_health legs
```
Listen to the audio and score the call against the checklist in
`TASK-01-aetna-ivr-live-testing.md §3.2`.

**Step 4 — Verify the job state in Redis:**
```bash
docker exec -it hrc-provider-agent \
  python scripts/verify_live_job.py <job_id> \
  --host https://hrc-outbound.cybersenz.com \
  --api-key "$INTERNAL_API_KEY"
```

### The only time your phone is involved

The **inbound test path** lets you call *in* to the server's Twilio number
(`+15105748747`) to test a single agent in isolation — useful for evaluating
just the Women's Health agent's conversation quality without firing a full
paired job. This is optional and only for isolated agent evaluation.

### Summary

| What you do | What you do NOT do |
|---|---|
| SSH into Azure VM | Pick up a phone |
| Run a script to trigger the job | Talk to Aetna yourself |
| Watch logs on your screen | Manually navigate any IVR |
| Listen to the saved Twilio recording | Be present during the call |
| Score the checklist + log findings | |

Testing hours that matter: **Mon–Fri, 8am–5pm PST** (California business
hours) — Aetna reps are only reachable then, which is why your Seattle
timezone was the reason you were brought on.

---

## 10. Test suite (tests/ — 269 passing)

```
New on this branch:
  test_aetna_ivr_routing   test_agent_registry     test_deploy_contract
  test_dry_run             test_inbound_defaults   test_inbound_extractor
  test_llm_proxy           test_outbound_readiness test_preflight_live
  test_probe_dashboard_contract                    test_prompt_templates
  test_retry_persistence   test_runtime_loader     test_sanitize
  test_status_recovery     test_sync_agent         test_transfer_auth
  test_verify_live_job     test_webhook_dlq        test_websocket_bridge

Removed from main:
  test_both_failed · test_extraction_provider · test_failure_callbacks ·
  test_prompt_no_phi · test_retry (replaced by test_retry_persistence)

Surviving from main (updated):
  test_callbacks · test_call_outcome · test_callback_dlq · test_completeness ·
  test_dashboard_auth · test_deidentify · test_extraction_encryption ·
  test_extraction_womens · test_hmac_signing · test_integration ·
  test_jobs_endpoint · test_merger · test_metrics_auth · test_race_safe_merge ·
  test_recording_storage · test_restoration · test_twilio_validation ·
  test_websocket_auth · test_audit_export
```

Run: `python -m pytest tests/ -v`  (all 269 pass as of 2026-05-27 readiness pass)

> **Reminder from the meeting:** unit tests are NOT the gate. The real validation
> is **live outbound calls + listening to audio**. Use `scripts/test_outbound.py`
> and `scripts/verify_live_job.py` for live E2E verification.

---

## 11. Key reference docs in-repo

```
README.md ................................. setup, endpoints, job lifecycle, HIPAA
docs/2026-05-27-production-readiness.md .. MOST RECENT — live E2E checklist + changes
docs/STATE_OF_UNION.md ................... full codebase audit, single source of truth
docs/DRY_RUN_PLAYBOOK.md ................. how to do a safe dry run
docs/dashboard-integration.md ............ contract with HRC-Outbound-WebApp
docs/dashboard-settings.md ............... ElevenLabs dashboard-only settings reference
docs/inbound-hmac-rollout.md ............. INBOUND_HMAC_ENABLED rollout
docs/codec-compatibility.md .............. mu-law / ulaw_8000 audio format notes
docs/redis-configuration.md .............. Redis TLS setup
audits/2026-04-23-*.md ................... recording-ready protocol trace + verifications
```

> The three large audit files (`VOICE_AGENTS_DEEP_AUDIT.md`, `VOICE_AGENTS_AUDIT.md`,
> `VOICE_AGENT_AUDIT.md`) and the `VOICE-AGENT-IMPLEMENTATION-SUMMARY.md` /
> `PHONE-ROUTING-SUMMARY.md` files from `main` were **deleted on this branch**.
> `docs/STATE_OF_UNION.md` is the replacement single source of truth.

---

## 12. Open questions / pre-live checklist

Items still requiring confirmation before first live call:

```
[x] Tax ID digits  — IVR workflow hardcodes 9,5,4,5,1,0,6,6,7.
                     CONFIRMED correct by Rajveer 2026-06-02 (WhatsApp).

[!] IVR→WH transfer & conversation_id — websocket.py captures ONE
                     conversation_id at init (the dialed/IVR agent). If the
                     in-call transfer_to_agent spawns a NEW conversation_id for
                     the WH portion, the post-call webhook may not map to the job
                     (→ DLQ). Safety net: timeout.check_missing_webhooks polls the
                     EL conversation API. MUST verify on the first live transfer —
                     this flow has never completed a live E2E run.

[?] ElevenLabs webhook URL — confirm workspace webhook is:
                     https://hrc-outbound.cybersenz.com/{provider|womens-health}
                     /webhooks/elevenlabs/post-call  and secret matches KV.

[?] Custom LLM API key — each ElevenLabs agent's "Custom LLM API key secret"
                     in the dashboard must match LLM_PROXY_AUTH_TOKEN in KV.

[?] Twilio Voice webhook URLs — must match the public APP_BASE_URL used by
                     require_twilio_signature (spoofing prevention).

[?] Model confirmed — extraction/client.py is tuned for GPT-5.x
                     (max_completion_tokens=16000, "GPT-5.x reasoning" comment),
                     but README says GPT-4.1. Confirm AZURE_OPENAI_DEPLOYMENT in KV.

[?] IVR agent synced — run sync_agent.py aetna-ivr to push the workflow graph to
                     ElevenLabs, AND set ELEVENLABS_AETNA_IVR_AGENT_ID in KV —
                     otherwise the single call dials the WH agent directly (no IVR).

[  ] Run preflight:  python scripts/preflight_live.py --env-only
[  ] Sync agents:    python scripts/sync_agent.py aetna-ivr
                     python scripts/sync_agent.py aetna-womenshealth
[  ] Probe contract: python scripts/probe_dashboard_contract.py
[  ] Dry run:        python scripts/dry_run.py --dry-run
[  ] First live job: python scripts/test_outbound.py  (use +44 test number)
[  ] Verify result:  python scripts/verify_live_job.py <job_id> ...
```
