# HRC Voice Agent — How It Works

## The problem we're solving

A fertility clinic (**HRC**) constantly needs to ask an insurance company (**Aetna**) a boring but important question:

> *"For this patient, what fertility treatments will you pay for, and how much?"*

A human would have to phone Aetna, sit through *"Press 1 for billing, press 2 for…"* menus, wait on hold forever, then ask a long checklist of questions. It's slow and tedious.

So they built a **robot that makes the phone call for them.**

---

## The big idea: two robots, ONE phone call

It's really **two robots taking turns on a single phone call.**

### Agent 1 — the "button-presser" (the *IVR Navigator*)

When you call a big company, a machine answers first: *"Press 1 for billing, press 2 for claims…"* Agent 1 listens to that menu and **presses the right buttons** — it types in:

- the clinic's **Tax ID**,
- the patient's **member ID**, and
- the patient's **date of birth**

…to get past all the menus and reach a **real human**. It stays silent and just taps buttons, carefully dodging traps (like *"press 2 to get a fax"* — it won't fall for that).

### Agent 2 — the "talker" (*Emily*, the Women's Health agent)

The moment a real Aetna person picks up, Agent 1 **quietly hands the phone to Agent 2** — on the *same* call. Agent 2 talks like a friendly, polite human and asks all the insurance questions (*"Is IVF covered? What's the copay?"*) across a list of 25 treatment types.

> **Important:** It's **one** phone call. Agent 1 hands off to Agent 2 in the middle of it — they do **not** make two separate calls.

---

## The helpers behind the scenes

| Helper | What it does |
| --- | --- |
| **Twilio** | The actual phone line that dials Aetna's number. |
| **ElevenLabs** | Gives the robots their voices and brains *during* the call. |
| **Azure OpenAI** | *After* the call, reads everything that was said and writes the answers down neatly. |
| **Encryption + Key Vault** | Keeps all private patient info locked in a safe. |
| **Dashboard** | The clinic's website where a person starts the job and later listens to the recording. |

---

## What happens, start to finish

```
1. A person starts a job on the dashboard (enters the patient's details).
2. Twilio dials Aetna.
3. Agent 1 presses the menu buttons until a real rep answers.
4. Agent 1 hands the call to Agent 2 (Emily), who asks the coverage questions.
5. The call ends. The conversation is saved (a recording).
6. Azure OpenAI reads the conversation and writes down the answers.
7. The system decides which "bucket" the result goes in (see below).
8. It tells the dashboard "Done — here's the result."
```

---

## The four possible results ("buckets")

| Result | Meaning |
| --- | --- |
| **ready_for_pdf** | Got all the answers cleanly → make the report. |
| **needs_review** | Something was missing or confusing → a human should check it. |
| **no_coverage** | The insurance won't cover fertility treatment for this patient. |
| **failed** | The call didn't work (no answer, technical problem, etc.). |

---

## Snehashis's job in all this

The robots do all the talking — **no personal phone is involved.** The testing role is to:

1. **Start a job** from the dashboard,
2. **Watch the logs** while the call happens,
3. **Listen to the recording** afterward,
4. **Score it** (did the buttons get pressed right? did the handoff work? did the rep answer the questions?), and
5. **Write down anything that went wrong** so it can be fixed.

This only works during **California business hours (Mon–Fri, 8am–5pm PST)**, because that's when real Aetna reps are reachable.

---

## One thing that's still untested

The handoff in step 4 (Agent 1 → Agent 2 on the same call) has **never been proven on a real live call yet**. Making that work end-to-end is the main goal of testing.