# Test-Call Runbook — Tier 1 (Safe Call to Your Own Phone)

**Goal:** place ONE safe test call to a number you control (your own mobile) to
prove the plumbing works — Twilio dials, the audio bridge connects, the agent
speaks, the IVR→WH transfer fires, and the post-call pipeline runs — **without
calling real Aetna**.

> This is the **Tier 1** test. It does NOT test real Aetna IVR navigation or a
> real rep conversation — that's the Tier 2 real-Aetna call (see
> [`TASK-01`](TASK-01-aetna-ivr-live-testing.md) Phase 3). Background:
> [`HOW-IT-WORKS-SIMPLE.md`](HOW-IT-WORKS-SIMPLE.md) ·
> [`KT-hrc-voice-agents.md`](KT-hrc-voice-agents.md).

---

> **Verified live 2026-06-08.** Jobs are fired by **uploading a CSV in View
> Database**, then **Start verification** on the dashboard. ⚠️ Calls ONLY go out
> when the **Operating Window = Active (08:15 AM–4:30 PM PDT, Mon–Fri)** — outside
> it the window shows **Closed** and nothing dials. (We hit this at 4:30.)

## Before you start

- [ ] **Operating Window must read "Active"** on the dashboard (08:15–16:30 PDT,
      Mon–Fri). If "Closed", the call won't fire — come back inside the window.
- [ ] CSV ready with **`to_number` = your phone** (real columns below).
- Have your phone in hand, ready to **answer and listen**.

> **Real CSV columns** (from the dashboard template):
> `insurance_id, patient_firstname, patient_lastname, doctor_name, doctor_npi,
> payer_company, doctor_location, dob, appointment_date, from_number, to_number`
> - **`payer_company` = `AETNA`** (exact). Other fields can be dummy.
> - **`to_number`** = your phone (numbers like `13615226664`, matching the
>   `from_number` `15105748747` format).
> - **`dob` = MM/DD/YYYY** full year.
> - A re-usable file already exists:
>   `test-run-MM-DD-YYYY/outbound_call_template_myphone.csv`.

---

## Step 1 — Upload the CSV

1. Log in to `https://hrc-outbound.cybersenz.com`.
2. **View Database** → **Choose File** → select your CSV → **Upload & Process**.
3. Confirm **"Upload complete"** and **Rows Processed: 1** (not Invalid/Duplicate).
   The record appears as `<patient> · AETNA · Voice · Ready to Call · <your phone>`.

## Step 2 — Fire the call

1. Go back to the **Dashboard**. Confirm queue **Ready = 1** and **Next Call
   Preview** shows your patient + your phone.
2. Confirm **Operating Window = Active**.
3. Under **Autonomous Mode → Call Lanes**, click **Start verification**.
   - With only your one record queued, the lane picks it up and dials your phone.
   - (Row actions in the queue are Info/Edit/Re-queue/Delete — there's no per-row
     "call now"; the lane control is how you fire it.)
4. Watch **Verification Metrics → In Progress (calls)** go to 1, and Lane A/B show
   the active call.

> Optional — watch VM logs in parallel: `ssh azureuser@4.149.74.135` (creds in
> WhatsApp) → voice-agents repo → `./deploy logs`. KV-backed CLI commands must run
> via **`startup-docker-compose.sh`**, not plain `docker exec`.

## Step 3 — Answer your phone and listen for

- [ ] Your phone rings and connects.
- [ ] You hear the agent (if IVR is dialed first, say "hello" — that should
      trigger the **transfer**; then **Emily** starts talking).
- [ ] Agent audio is clear, two-way (it hears you, you hear it).
- [ ] Speak a few words as if you were a rep — confirm it responds.
- [ ] Hang up when done (or let it end).

## Step 4 — Watch the logs (optional terminal) for this sequence

```
Initiating womens_health call ... job=<id>
Twilio stream started / First Twilio audio packet ... / First ElevenLabs audio packet
(if IVR) human voice detected → transfer_to_agent
Twilio status callback: status=completed
Received ElevenLabs webhook: type=post_call_transcription
Processed post-call webhook: job=<id> ... completeness=...
Dashboard callback sent: job=<id> status=...
```

## Step 5 — Review the result on the dashboard
Open the job in the dashboard and confirm:
- [ ] Job reached a terminal status (`ready_for_pdf` / `needs_review` / `failed` —
      any is fine for a dummy self-test).
- [ ] **Recording is playable** + **PDF** populated (older recordings move to
      archive storage and need ~a day to rehydrate).
- [ ] Note anything unit tests can't catch: mispronounced words, latency, awkward
      pauses, whether the IVR→WH handoff was clean.

(Optional, on the VM, for the raw record — run via `startup-docker-compose.sh` so
KV secrets load: `verify_live_job.py <job_id>` / `GET /jobs/<job_id>`.)

---

## What this proved / didn't

| Proved | Did NOT prove |
|---|---|
| Twilio dials + connects | Real Aetna IVR navigation |
| Audio bridge (both directions) | A real rep conversation |
| Agent speaks; IVR→WH transfer fires | Tax ID / member ID accepted by real Aetna |
| Recording + PDF saved | Real coverage data extraction |
| Webhook → extraction → callback pipeline | — |

**Next — Tier 2:** real Aetna call with the **real-patient CSV** Rajveer sends,
during **8:15am–4:30pm PST** (the autonomous lanes' best-Aetna window). See
[`TASK-01`](TASK-01-aetna-ivr-live-testing.md) Phase 3 and score the §3.2 checklist.
After each call, decide if a fix is **prompt** vs **code** (Rajveer expects mostly
prompt), make the change, re-call, repeat.

---

## Troubleshooting

| Symptom | Likely cause / where to look |
|---|---|
| `400 error` on upload | `payer_name` not `Aetna` (or an unconfigured payer) |
| Call/DOB issues | DOB must be `MM/DD/YYYY` full year; numbers must be E.164 `+1…` |
| KV cmd shows "0 settings" | Use `startup-docker-compose.sh`, not plain `docker exec` |
| Job `failed` immediately | Missing secret / agent not synced — check `./deploy logs` |
| Phone never rings | Wrong `to number` format, or it wasn't changed from the `…5999` line |
| Call connects but silence | Audio bridge — look for "First ElevenLabs audio packet" in logs |
| You hear Emily but no IVR step | IVR agent not configured (`ELEVENLABS_AETNA_IVR_AGENT_ID`) |
| No webhook after call | ElevenLabs webhook/secret mismatch; `check_stalled.py` polls EL API |
| Job stuck `in_progress` | run `check_stalled.py` (via `startup-docker-compose.sh`) |
| Callback DLQ has entries | run `replay_callback_dlq.py` (via `startup-docker-compose.sh`) |
