# Test Run Log — 2026-06-08

## Goal
Self-test call to my own phone (`+13615226664`) via the dashboard, to verify the
plumbing before real Aetna calls.

## What we did
1. Built a test CSV from Rajveer's template, with `to_number` = my phone:
   `test-run-06-08-2026/outbound_call_template_myphone.csv`
   (patient = Henry Lee, AETNA, `from_number` 15105748747, `to_number` 13615226664).
2. Dashboard → **View Database** → **Choose File** → **Upload & Process** →
   "Upload complete." → **Rows Processed: 1**. Record showed as
   **Henry Lee · AETNA · Voice · Ready to Call · +13615226664**.
3. Back to **Dashboard** → queue showed **Ready 1**, Next Call Preview = Henry Lee.
4. Clicked **Start verification**.

## Result: call did NOT fire ❌
- Phone never rang.
- The **Operating Window flipped to "Closed"** — we hit **Start verification right
  at the 4:30 PM PDT cutoff**.
- Lane stayed `paused`; Queued went 1→0 but **In Progress stayed 0** = no call placed.

## Why (root cause) — CORRECTED 2026-06-09
**The operating window was NOT the blocker.** Rajveer clarified (and the code
confirms): the **"Start verification" top button** = `dispatchOneCallLane` →
`POST /api/outbound/autonomous/call-lanes/dispatch-one`, which has **no
operating-window check** (only disabled when the queue is empty). So the manual
button works after 4:30 — we used the right button.

Two buttons, different behavior (`AutonomousModePanel.tsx`):
- **"Start verification"** (top) = manual single dispatch — **ignores the window**. ← use this for self-tests.
- **"Start Calls" / "Resume"** (below) = the autonomous runner — **window-gated**
  (`08:15`–`16:30` Mon–Fri LA, hardcoded in `autonomous_runner.py`). These are
  disabled outside the window, which is what we saw greyed out.

So the no-ring was a **downstream failure** (the dispatch fired but the call
didn't connect), NOT the window. Need to retry and find where it dies (eligibility,
voice-agent, or Twilio). The OVERDUE record (132 days) is a suspect — check whether
eligibility skips overdue rows.

## State for tomorrow
- The CSV is ready and re-usable: `outbound_call_template_myphone.csv`.
- Henry Lee may still be in the queue (was Ready 1). If not, just re-upload the CSV.
- Note: the record is **OVERDUE (132 days past appointment, Jan 27 2026)** but still
  showed "Ready to Call" — didn't block queueing. Can update `appointment_date` to a
  near-future date if overdue ever causes issues.

## RESUME steps (manual button works ANY time — no window needed)
1. Open `https://hrc-outbound.cybersenz.com`.
2. If queue is empty: **View Database** → upload `outbound_call_template_myphone.csv`
   → confirm Rows Processed: 1. Confirm **Ready 1**, phone `+13615226664`.
3. (Optional) Open VM logs in another terminal to watch live:
   `ssh azureuser@4.149.74.135` → voice-agents repo → `./deploy logs`.
4. Have phone in hand → click **"Start verification"** (the TOP button).
5. **Diagnose where it goes:**
   - Does **In Progress (calls)** go to 1, and a Lane (A/B) show the active call?
   - Does the phone ring? If yes → answer & listen (audio both ways, mispronunciation,
     latency, IVR→WH handoff).
   - If NO ring → check **Completed Calls** + the **Failed** count, and the VM logs,
     to see where it died (eligibility / voice-agent dispatch / Twilio).
6. After: **Completed Calls** → open it → recording, PDF, transcript. Log findings.

## Suspects if it still doesn't ring
- **OVERDUE record** (132 days past appt) — eligibility may skip it. Fix: set
  `appointment_date` to a near/future date in the CSV and re-upload.
- Voice-agent service issue / Twilio — check `./deploy logs` on the VM.

## Answered / open for Rajveer
- [x] Manual after-hours calls — **"Start verification" (top button) bypasses the
  window** (Rajveer confirmed via WhatsApp 2026-06-08 10:45 pm: *"You can still run
  calls manually after 4:30 using the top button on the autonomous runner"*; logged
  in `project-discussion.md`).
- [ ] Confirm full operator rights (account shows "manager / client access").
