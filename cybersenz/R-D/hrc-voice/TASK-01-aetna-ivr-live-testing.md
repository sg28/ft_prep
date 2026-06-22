# HRC Voice Agent — Live Testing Plan
**Owner:** snehashis ghosh
**Branch:** `feature-aetna-ivr-agent`
**Goal:** Validate the Aetna IVR Navigator + Women's Health dual-agent system
via real live outbound calls during California business hours (PST).
**Last updated:** 2026-06-01

---

## How this works (read first)

**You do not use your personal phone.** The system places the calls.

```
You trigger a job from the dashboard (HRC-Outbound-WebApp — URL TBC, see §0.1)
   (the Azure VM is for logs, env checks, and agent sync via SSH)
        │
        ▼
Twilio dials Aetna's phone number
        │
        ▼
ElevenLabs AI agent talks to Aetna
  → IVR Navigator enters Tax ID, member ID, DOB via keypad tones
  → transfers silently to Women's Health agent once a rep answers
  → Women's Health agent asks fertility coverage questions
        │
        ▼
Call ends → Twilio saves a recording
         → Azure OpenAI extracts structured fields from the transcript
         → Job result sent back to the dashboard
         → you replay the recording from the dashboard
```

Your role: **trigger the job from the dashboard, watch VM logs, listen to the
recording in the dashboard, document what worked and what didn't.** The AI does
all the talking.

> **Access note (2026-06-01):** Calls and recording playback are both done in
> the HRC-Outbound-WebApp dashboard (login URL TBC — see §0.1), not via Twilio
> console or `scripts/test_outbound.py`. SSH into
> the VM is still used for preflight, agent sync, log tailing, and job
> verification. ElevenLabs dashboard access was declined (zero-retention model).
>
> **Infrastructure migration in progress (2026-06-02):** Arpit is rebuilding
> the entire Azure stack via Terraform (`github.com/Cybersenz-Inc/HRC-infra`).
> Plan: build in `HRC-dev` RG → destroy `HRC` RG → rename. The VM IP
> (`4.149.74.135`) and Key Vault URL may change after migration. Coordinate
> with Arpit before running Phase 3 live calls. See `r&d/hrc-infra/NOTES.md`.

---

## Background

Rajveer onboarded snehashis specifically for voice agent testing because of
PST timezone alignment with the HRC fertility clinic in California. Rajveer is
8 hours ahead and cannot test late enough to reach live Aetna reps.

The `feature-aetna-ivr-agent` branch introduces a new **IVR Navigator** agent
that navigates Aetna's automated phone tree (DTMF tones, trap handling) before
handing off silently to the **Women's Health** conversational agent. This
two-agent flow has **never had a successful end-to-end live run** — that is the
primary objective of this testing plan.

Unit tests (269) already pass. The gap is live call quality and agent behavior
that only real calls can reveal.

---

## Definition of done

This task is complete when all of the following are true:

- [ ] At least **3 successful end-to-end calls** completed (`ready_for_pdf` or
      `needs_review` status) against real Aetna during PST business hours
- [ ] All checklist items in Phase 3.2 scored for each call
- [ ] Every failure has a logged root cause and a suggested fix
- [ ] All findings documented (locally in `r&d/hrc-voice/`, or Confluence if access is set up)
- [ ] Rajveer has been briefed on results

---

## Status tracker

| Phase | Step | Status |
|-------|------|--------|
| 0 | Get SSH access to VM | [x] received 2026-05-31 |
| 0 | Get dashboard access | [x] received 2026-05-31 |
| 0 | Azure portal access (Contributor) | [x] granted 2026-06-08 — Contributor on `HRC` + `HRC-dev` (KT call) |
| 0 | Confirm Tax ID digits with Rajveer | [x] confirmed correct 2026-06-02; re-confirmed 2026-06-08 (company-wide, not per-location) |
| 0 | Dashboard walkthrough with Rajveer | [x] done 2026-06-08 (KT call — CSV upload flow) |
| 0 | Synthetic Aetna test patient | [x] use DUMMY data for self-test (payer=Aetna); real-patient CSV from Rajveer (expected 2026-06-09) |
| 0 | Confirm ElevenLabs + Twilio webhooks | [~] ElevenLabs access declined; dashboard gives needed visibility, no Twilio access needed |
| 1 | SSH into Azure VM | [x] done 2026-06-10 (read-only; log review of both agents) |
| 1 | Health check (`/health/ready`) | [x] done 2026-06-10 — both agents healthy |
| 1 | (KV cmds via `startup-docker-compose.sh`, NOT plain docker exec) | [ ] |
| 2 | Self-test call to OWN phone (dummy data, dashboard CSV) | [x] **done 2026-06-10** — outbound fired via manual "Start verification" top button (off-hours, per Rajveer); call `CA3d664aae…` connected + held a ~10-min two-way conversation with Emily (54 gpt-5.1 turns, all 200 OK). ended abnormally (EL **1006** close + dead-air at end) → **BUG-005 (investigating)**. **Routing note:** own-cell numbers route straight to Emily/WH and **bypass the IVR/Provider agent**, so this did NOT test BUG-002. See `test-run-06-10-2026/RUN-LOG.md` |
| 2 | Inbound behavior test (call agent directly) | [x] **PASS 2026-06-10 on Women's Health** — inbound call `CA3ab27f…` ran 441s (~7m21s), two-way audio, clean close, **zero 1002**. START-node fix verified deployed (workflow.py md5 `420293c1…`, redeployed 17:01:44 UTC); BUG-001 + BUG-003 fixed. **IVR/Provider agent still BLOCKED → BUG-002** (not redeployed, still old md5 `1fd70c6…`, 1002 persists). See `test-run-06-10-2026/RUN-LOG.md` + `bugs/bugs.csv` |
| 2 | Listen to recording + note prompt/latency issues | [~] 2026-06-10 — outcome + extraction captured (`call_notes`, `confidence=high`); verbatim transcript not on VM (`zero_retention_mode`). Score §3.2 from ElevenLabs `conv_4501…` or the Twilio recording — pending |
| 3 | First real Aetna call (real-patient CSV, 8:15am–4:30pm PST) | [ ] |
| 3 | Listen to recording + score checklist | [ ] |
| 4 | Repeat calls; identify prompt vs code fixes; brief Rajveer | [ ] |

---

## Phase 0 — Blockers (need Rajveer)

> **Update 2026-06-08 (from KT call w/ Rajveer — see
> `r&d/converted-md/06-08-2026/rajveer-kt-01.txt` & `-02.txt`):**
> **All Phase-0 blockers are effectively cleared.** Azure Contributor access
> granted on both `HRC` (current VM/prod) and `HRC-dev` (Arpit's ACA migration);
> dashboard walkthrough done; Tax ID re-confirmed; and self-testing uses **dummy
> data** (real-patient CSV arrives next). Calls are fired by **uploading a CSV in
> the dashboard Call Queue** (see new §0.5). Today's task: **self-test calls to my
> own phone**, listen to recordings, note prompt/latency issues.
>
> **Earlier (2026-06-01, WhatsApp):** VM + dashboard access received; ElevenLabs
> access declined (zero-retention model); no Twilio access needed.

### 0.1 Confirm access

- [x] **VM access received** (2026-05-31).
      - Host: `4.149.74.135`
      - User: `azureuser`
      - Password: `Cy3br53nz123$`
      - SSH: `ssh azureuser@4.149.74.135`
      - All three HRC repos live under `/apps` → voice repo at
        `/apps/HRC-Voice-Agents`.
      - → TODO: rotate VM password + switch to SSH key auth after first login
        (plaintext password was shared over chat; this is a PHI system).
- [x] **Dashboard access received** — this is the **HRC-Outbound-WebApp**
      (separate repo from the voice agent), the operator UI where outbound
      calls are triggered AND call recordings are played back.
      - Username: `rajveer@securecrm.ai`  ← login account, NOT the URL
      - Password: `jhg_gzn4MJC4gpw-tea`
      - Login URL: **`https://hrc-outbound.cybersenz.com`** — CONFIRMED on the
        VM 2026-06-01. This is the **production** environment. The login above is
        Rajveer's own account (ask for a dedicated user later). **How to fire a job
        is now documented in §0.5** (KT call 2026-06-08).
- [x] **Azure portal access received** (2026-06-08, KT call) — **Contributor** on
      both resource groups:
      - **`HRC`** — the current production VM (predecessor). Most of your testing
        + log viewing is here.
      - **`HRC-dev`** — Arpit's in-progress 4× Azure Container Apps migration.
      - Invite finally worked via the **Gmail** account after secure-CRM looping
        issues; portal: `portal.azure.com` → View all resources.

> **Credentials note:** the two logins above are the only credentials obtained.
> All runtime secrets (ElevenLabs / Twilio / Azure OpenAI keys, HMAC secrets,
> Fernet key) live in Azure Key Vault (`outboundhrc.vault.azure.net`) and are
> loaded into the app process at startup — they are NOT readable via the VM
> shell, and were not extracted. Use the dashboard + VM access above to operate;
> request specific secrets from Rajveer only if a task genuinely requires one.
- [x] **Azure portal** — Contributor access granted 2026-06-08 (see §0.1). Sign in
      at `portal.azure.com` (the Gmail account that worked) → View all resources →
      both `HRC` and `HRC-dev` visible.
- [x] **Azure Key Vault** — `outboundhrc.vault.azure.net` reachable via the portal
      now. Note: **KV-backed CLI commands on the VM must run through
      `startup-docker-compose.sh`** (it injects the KV secrets); plain
      `docker exec` / `docker compose` won't have them (see Finding 1).

### 0.2 Confirm Tax ID with Rajveer — CONFIRMED

The IVR Navigator workflow has HRC's Tax ID hardcoded as DTMF digits:
`9, 5, 4, 5, 1, 0, 6, 6, 7`  (matches `DEFAULT_TAX_ID=954-510-667` in `.env.example`)

File: `agents/Aetna/ivr/workflow.py` — node `ENTER_TAX_ID`

Confirmed via WhatsApp (2026-06-02) and re-confirmed in the KT call (2026-06-08):
it is HRC's **company-wide** Tax ID (identifies the company, *not* location-specific).
No code change needed.

### 0.3 Test patient data — RESOLVED

- **For self-testing (today):** use **dummy data** in the CSV. The only field that
  must be exact is **`payer_name = Aetna`** (it selects which IVR + question set
  runs). Everything else can be fake: e.g. `John Doe`, `Dr. James`, NPI
  `987654321`, insurance ID `123456789`. The flow still runs end-to-end.
- **For real Aetna calls:** Rajveer will send a **CSV of real patient data + the
  real destination number** (expected 2026-06-09).
- Jobs are fired by **uploading the CSV in the dashboard** (see §0.5), NOT via
  `dry_run.py`/`test_outbound.py`.

### 0.4 ElevenLabs + Twilio webhooks — access declined, dashboard gives visibility

Rajveer declined ElevenLabs dashboard access: under the zero-retention model it
would only show *that* a webhook fired, which the dashboard already surfaces.

- Trade-off: no ElevenLabs **conversation traces**. The Phase 3.3 triage
  rows for "WH agent not reached / dead air" and "transfer fails" rely on those
  traces — if a live call fails mid-handoff, request temporary ElevenLabs
  access then.
- Still worth asking Rajveer to confirm (he has the access):
  - ElevenLabs workspace webhook URL + secret match Key Vault
    (`elevenlabs-webhook-secret` / `elevenlabs-webhook-secret-wh`)
  - Each agent's **Custom LLM API key** matches `LLM_PROXY_AUTH_TOKEN` in KV
  - Twilio Voice webhook + status callback URLs match the deployed `APP_BASE_URL`

### 0.5 How to fire a call (dashboard CSV upload) — from KT call 2026-06-08

Jobs are created by uploading a CSV in the dashboard. Steps:

1. Dashboard → **Call Queue** → **View Database**.
2. Top-right (under your name) → **Download Template** → save the CSV.
3. Populate a row:
   - **`payer_name` = `Aetna`** ← mandatory & exact (selects the Aetna IVR +
     question set). Other payers (e.g. Anthem Blue Cross) 400-error until added.
   - Other fields can be **dummy** for self-test: name (`John Doe`), doctor
     (`Dr. James`), NPI (`987654321`), insurance/member ID (`123456789`),
     doctor location, appointment date.
   - **`from number`** = the system caller-ID (the `+1510…4749` number).
   - **`to number`** = destination. For a **self-test, replace the number ending
     in `5999`** (Aetna's WH line) **with your own mobile**.
4. **Formatting (critical):** phone numbers in **E.164** (`+1…`); **DOB =
   MM/DD/YYYY with the FULL year** (`01/15/2026`, not `…/26`). Wrong DOB format
   is a known time-sink bug.
5. **Pause the autonomous runner** before uploading (otherwise it fires the call
   immediately on upload).
6. Upload the CSV → **Ready to Call** triggers the call.
7. Recording, transcript, and the populated PDF appear **on the dashboard** after
   the call (older recordings move to archive storage and need ~a day to
   rehydrate).

> **Off-hours calls — CONFIRMED by Rajveer (WhatsApp, 2026-06-08):** *"You can
> still run calls manually after 4:30 using the top button on the autonomous
> runner."* So the Operating Window (08:15–16:30 PDT) gates only the **autonomous
> lanes**; the **manual "Start verification" (top) button fires a call any time**,
> window Closed or not. The window is a data-quality choice for *real Aetna* (best
> answers during business hours) — it is NOT a hard block on dialing. This means
> off-hours testing (incl. the BUG-002 provider/IVR test against the Twilio test
> number) is possible via the manual button.

> Idea (mine): wire an **MCP connector** for the CSV/Excel files so cells (esp.
> DOB formatting) are filled programmatically instead of by hand. Rajveer was open
> to it.

---

## Live VM verification — findings (2026-06-01)

First SSH onto the VM (`ssh azureuser@4.149.74.135`). Read-only checks only; no
calls placed.

### System is live and healthy
- Both voice agents return `{"status":"ready","redis":"ok"}`:
  `curl http://localhost:8001/health/ready` (provider),
  `curl http://localhost:8002/health/ready` (womens-health).
- Containers (`docker ps`) all `Up … (healthy)`:
  - `hrc-provider-agent` (:8001), `hrc-womens-health-agent` (:8002),
    `hrc-voice-redis` — the voice stack.
  - `hrc-outbound-webapp-{nginx,app,fastapi,sweeper-scheduler,pdf-worker,redis,
    postgres}` — the **dashboard** (nginx :80/:443 → `hrc-outbound.cybersenz.com`).
  - `hrc-chat-agent` (+ `…-agent-1`) — the chat agent.
- The app boots **fail-closed** on required secrets, so a healthy boot proves all
  required runtime secrets are present and valid in Key Vault.

### Finding 1 — the documented preflight step gives FALSE failures
`docker exec hrc-provider-agent python scripts/preflight_live.py --env-only`
reports `Key Vault loaded: 0 setting(s)` and lists every secret as "missing".
This is a **false negative**: the standalone script's KV loader returns nothing
in a fresh `docker exec` process, even though the running app loaded the same
secrets fine at startup (containers are healthy). Container env confirms
`KEYVAULT_ENABLED=true`, `AZURE_KEY_VAULT_URL=https://outboundhrc.vault.azure.net/`,
with `AZURE_OPENAI_ENDPOINT` / `LLM_PROXY_BASE_URL*` empty in env (KV-only).

→ **FIX (from KT call 2026-06-08):** this isn't a bug — KV-backed commands must be
  run through **`startup-docker-compose.sh`**, which pulls the secrets from Key
  Vault first. Plain `docker exec` / `docker compose` runs in a process that never
  loaded KV, hence the "0 settings". Use `startup-docker-compose.sh` for anything
  needing secrets (preflight, DB queries, sync). `/health/ready` + healthy boot
  remain the quick liveness check.

  **Rebuild scripts:**
  - Voice agents: `deploy.sh rebuild` (safe; doesn't affect other agents).
  - Dashboard: `deploy-main.sh` — if run in the daytime, message the group chat
    first; it can **orphan in-flight jobs** / disrupt the chat agent.

### Finding 2 — `/apps` is empty
The three repos are NOT under `/apps`. From the KT call: the repos are
`HRC-Outbound-WebApp` (dashboard, current dir in demo), `HRC` voice-agents repo,
and the chat agent — navigate via `cd ../` / `cd HRC...` on the VM. Server login
credentials for the VM/terminal are in **WhatsApp**.

### Net effect on items 5–8 (self-verify attempt)
- **Item 3 (dashboard URL):** confirmed `https://hrc-outbound.cybersenz.com`.
- **Items 5/6/7 (webhook/secret/Twilio match):** cannot be self-verified from the
  VM (KV-in-exec returns 0). Secret *presence* is proven by healthy boot; true
  cross-system *match* is only proven by a successful **test call**.
- **Item 8 (model deployment):** code is tuned for **GPT-5.x**
  (`extraction/client.py`, `max_completion_tokens=16000`), despite the README
  saying GPT-4.1. With Azure portal access now granted, the exact
  `AZURE_OPENAI_DEPLOYMENT` value can be read from Key Vault in the portal.
  (Rajveer also noted GPT-5 family is **East US 2** only.)

> **Architecture correction (2026-06-06):** A full source read shows the system
> places **ONE outbound call** (IVR Navigator → in-call transfer → Women's Health),
> not two calls as the older notes implied. The `provider_line` leg is permanently
> `skipped`. See the authoritative, code-grounded KT doc:
> `r&d/hrc-voice/KT-hrc-voice-agents.md`. The "IVR" and "WH" checklist groups in
> §3.2 are logical *phases of one call*, not separate calls.

**Conclusion:** config inspection has gone as far as it usefully can. The real
blocker remaining is the synthetic test patient (Tax ID now confirmed); the
cleanest way to verify items 5–8 is to place one real test call once it arrives.

---

## Phase 1 — Environment setup (no calls placed)

Run all of these **inside the Azure VM container** via SSH. No calls are placed
in this phase.

### 1.1 SSH into the Azure VM

```bash
ssh azureuser@4.149.74.135      # password in §0.1

# Find the running containers
docker ps

# Expected: hrc-provider-agent (8001) + hrc-womens-health-agent (8002)
#           hrc-voice-redis  (+ hrc-outbound-webapp-* dashboard, hrc-chat-agent)
```

### 1.2 Check container health

```bash
curl http://localhost:8001/health/ready
curl http://localhost:8002/health/ready
# Both should return: {"status": "ready", "redis": "ok"}
```

### 1.3 Run preflight — validate all secrets and config

```bash
docker exec -it hrc-provider-agent python scripts/preflight_live.py --env-only
```

This checks: required env vars loaded, URL shapes valid, Twilio number format,
Fernet key shape, ElevenLabs agent payloads — without placing any call.

> **KNOWN FALSE NEGATIVE (verified 2026-06-01):** in a fresh `docker exec`
> this prints `Key Vault loaded: 0 setting(s)` and reports every secret as
> "missing" — even though the live app loaded them fine (containers are
> healthy). The standalone script's KV loader returns nothing in an exec
> context. **Do not treat these errors as real.** Trust `/health/ready` (§1.2)
> and the fail-closed boot instead. See "Live VM verification — findings". The
> same KV-in-exec issue likely affects `sync_agent.py` / `compare_agents.py`.

### 1.4 Sync the IVR agent to ElevenLabs

```bash
# Preview what will be pushed (dry run)
docker exec -it hrc-provider-agent python scripts/sync_agent.py aetna-ivr --dump

# Review the output — confirm workflow nodes match ARCHITECTURE.md §7
# Then push live:
docker exec -it hrc-provider-agent python scripts/sync_agent.py aetna-ivr
```

### 1.5 Sync the Women's Health agent to ElevenLabs

```bash
docker exec -it hrc-provider-agent python scripts/sync_agent.py aetna-womenshealth --dump
docker exec -it hrc-provider-agent python scripts/sync_agent.py aetna-womenshealth
```

### 1.6 Probe dashboard callback contract

```bash
docker exec -it hrc-provider-agent python scripts/probe_dashboard_contract.py
```

Verifies the HMAC signing contract between the voice agent and the dashboard.

---

## Phase 2 — Safe test calls (no real payer dialed)

The `+44` UK number (`+447360278297`) triggers a test caller-ID path in the
code. Calls to a `+44` destination use `TWILIO_TEST_NUMBER` as the caller ID
and should be directed at a test/dummy number — NOT a real Aetna line.

### 2.1 Dry run

```bash
docker exec -it hrc-provider-agent python scripts/dry_run.py --dry-run
```

Simulates job creation and call launch without actually dialing. Confirm no
errors.

### 2.2 First real test call

```bash
# Ask Rajveer for the correct test destination number to use
docker exec -it hrc-provider-agent python scripts/test_outbound.py
```

While it runs, watch logs live in a separate terminal:

```bash
./deploy logs
```

### 2.3 Verify the test job

After the call completes, grab the `job_id` from the logs and run:

```bash
docker exec -it hrc-provider-agent \
  python scripts/verify_live_job.py <job_id> \
  --host https://hrc-outbound.cybersenz.com \
  --api-key "$INTERNAL_API_KEY"
```

**What to confirm:**
- Redis job state reached a terminal status (`ready_for_pdf`, `needs_review`,
  or `failed` — any of these is fine at this stage, `failed` just means
  something to investigate)
- Conversation mapping stored (`conv:{id} → job_id`)
- No stuck entries in callback DLQ
- Dashboard received the callback (check with Rajveer)

---

## Phase 3 — First real Aetna call

Run during **California business hours: Mon–Fri, 8am–5pm PST**.
Start with ONE call. Do not run multiple jobs until the first one succeeds.

### 3.1 Create a real job

Ask Rajveer for a **synthetic test patient record** with valid Aetna details.
You need these specific fields:

| Field | Example | Where used |
|---|---|---|
| `patient_first_name` | Jane | Agent greeting |
| `patient_last_name` | Doe | Agent verification |
| `patient_dob` | 01/15/1990 | IVR DTMF entry (MMDDYYYY) |
| `member_id` | W123456789 | IVR DTMF entry |
| `group_number` | 12345 | Job record |
| `payer_name` | Aetna | Phone number lookup |
| `provider_name` | Dr. Smith | Agent script |
| `provider_npi` | 1234567890 | Agent script |

Once you have the record, open one terminal on the VM for logs:

```bash
./deploy logs
```

Then **trigger the job from the dashboard** (HRC-Outbound-WebApp — URL TBC, §0.1). Rajveer confirmed
calls are fired from the dashboard, not from `scripts/test_outbound.py` — the
script has no CLI flags for patient fields (only `--payer` / `--phone`), so the
patient record is entered in the dashboard. Have Rajveer show you the first time.

### 3.2 Listen to the recording

Recording playback is **in the dashboard** (HRC-Outbound-WebApp — URL TBC, §0.1)
— open the job and play the recording for each leg. No Twilio console needed.

If you also want the raw job record (extraction fields, leg statuses, recording
URLs) from the API, run from the VM:

```bash
curl -H "X-API-Key: $INTERNAL_API_KEY" \
  https://hrc-outbound.cybersenz.com/jobs/<job_id>
# Look for recording_url in provider_line and womens_health legs
```

Listen to the full recording and score against this checklist:

```
IVR NAVIGATOR LEG
  [ ] Call connected (not dropped, not busy, not no-answer)
  [ ] IVR greeting was heard before agent responded
  [ ] Tax ID entered correctly — IVR accepted it
  [ ] Caller type 2 pressed successfully
  [ ] Member ID entered correctly
  [ ] DOB entered correctly (8 digits, no slashes)
  [ ] IVR moved to next step (did not loop or ask to repeat)
  [ ] Any traps encountered? (fax offer / benefit menu / ANSI menu)
      → If yes: was TRAP_INTERCEPT node handled correctly?
  [ ] AWAIT_REP_PRESS_ZERO: pressed 0, waited for human
  [ ] Human rep answered (hold music heard before rep spoke)
  [ ] Transfer to Women's Health agent was clean (no dead air >3s)

WOMEN'S HEALTH LEG
  [ ] Agent introduced as "Emily" naturally
  [ ] Rep stayed on the line (did not hang up or refuse AI)
  [ ] Verification questions answered by rep
  [ ] CPT code section reached (rep provided coverage info)
  [ ] Agent did not repeat questions unnecessarily
  [ ] Call ended naturally (not dropped mid-conversation)
  [ ] Wrap-up completed

EXTRACTION + PIPELINE
  [ ] Job reached ready_for_pdf or needs_review (not failed)
  [ ] extraction fields populated in /jobs/<id> response
  [ ] Dashboard received callback (confirm with Rajveer)
```

### 3.3 Failure triage guide

| Symptom | Likely cause | Where to look |
|---------|-------------|---------------|
| Job status = `failed` immediately | Missing secret / IVR agent not synced | Preflight logs, sync_agent output |
| Call = `no-answer` or `busy` | Wrong phone number for payer | `config/payer_directory.py`, ask Rajveer |
| IVR rejects Tax ID | Wrong digits hardcoded | `agents/Aetna/ivr/workflow.py` ENTER_TAX_ID node |
| IVR loops / no progress after 30s | Unrecognised IVR prompt → FAILSAFE_TRANSFER fired | Recording audio, logs for `FAILSAFE` |
| Transfer to WH agent fails | `transfer_to_agent` tool not configured in ElevenLabs | Re-sync aetna-ivr with `sync_agent.py` |
| WH agent not reached / dead air | IVR handoff timing issue | ElevenLabs dashboard conversation trace |
| Rep hangs up immediately | Rep identified AI voice | Prompt tuning needed — note exact moment in transcript |
| Rep gives false info | Known risk per Rajveer — note and log | Confluence finding |
| Job stuck as `in_progress` > 30min | Stalled job detector | `scripts/check_stalled.py` |
| Callback DLQ has entries | Dashboard callback failed | `scripts/replay_callback_dlq.py` |
| Extraction fields mostly null | Low completeness score | `extraction/completeness.py` threshold |

---

## Phase 4 — Repeat testing + documentation

Once Phase 3 produces at least one successful end-to-end call:

### 4.1 Test across scenarios

Run calls covering these cases (one at a time, document each):

| Scenario | What to test |
|----------|-------------|
| Standard PPO | Happy path — full CPT code coverage |
| HMO plan | Does agent handle HMO-specific questions? |
| Coverage inactive | Does pipeline reach `no_coverage` correctly? |
| Rep refuses AI | How does call end? Is it recoverable? |
| IVR structure change | Aetna may update IVR — does FAILSAFE catch it? |
| Long hold time | Does bridge time out or hold correctly? |

### 4.2 Document every call

For each call, log (locally in `r&d/hrc-voice/` until Confluence is set up):
- Date / time (PST)
- Patient scenario (synthetic)
- Job ID
- Final job status
- Checklist result from Phase 3.2
- Recording timestamp of any failure point
- Exact transcript excerpt if something went wrong
- Suggested fix (code change, prompt change, or workflow change)

Once Confluence access arrives from Rajveer, move findings there.

### 4.3 Communicate findings to Rajveer

Message Rajveer directly with a summary of each call result.
Flag anything that requires a code or prompt change — Rajveer said to suggest
changes if you see a better approach.

Once the WhatsApp group is created, use that for quick updates.

---

## Reference

| Resource | Location |
|----------|----------|
| **KT doc (authoritative, code-grounded)** | `r&d/hrc-voice/KT-hrc-voice-agents.md` |
| Architecture overview (corrected) | `r&d/hrc-voice/ARCHITECTURE.md` |
| IVR workflow graph | `agents/Aetna/ivr/workflow.py` |
| IVR prompt | `agents/Aetna/ivr/prompt.md` |
| Women's Health prompt | `agents/Aetna/womens_health/prompt.md` |
| Production readiness doc | `docs/2026-05-27-production-readiness.md` |
| Live E2E checklist | `docs/DRY_RUN_PLAYBOOK.md` |
| Current codebase audit | `docs/STATE_OF_UNION.md` |
| Deploy commands | `./deploy logs / status / restart / health` |
