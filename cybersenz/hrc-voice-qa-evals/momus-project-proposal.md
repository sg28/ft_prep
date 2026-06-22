# <span style="color: rgb(229, 87, 87);">MOMUS</span> <span style="color: rgb(150, 150, 150);">v0.1.0</span>

#### MOMUS is a Python-based evaluation pipeline that runs against completed voice agent call recordings stored in Azure Blob Storage. It orchestrates four sequential operations:

- calls ElevenLabs Scribe to transcribe the audio and identify each speaker
- extracts signal metrics (latency, silences, interruptions) from the transcript timestamps
- validates the conversation flow against a defined checkpoint list
- calls GPT-5.1 on Azure OpenAI to score the call against the rubric and produce the final verdict

MOMUS does not perform any of these operations itself — it coordinates them in sequence, passes outputs between steps, and assembles the final JSON evaluation report which is written back to Azure Blob.

For the POC it is executed as a command-line script: `python -m evals.voice.run_eval <call-uuid>`. In production it will be invoked programmatically as the final step of the existing HRC-Outbound-WebApp post-call pipeline, after the WAV recording has been uploaded to Azure Blob, running automatically after every completed call.

#### What is the Rubric

The rubric is the definition of what a good call looks like. It is a <span style="color: rgb(229, 87, 87);">text/JSON file</span> MOMUS loads at runtime and sends to GPT-5.1 alongside the transcript and metrics. It defines 5 dimensions totaling 100 points:

- <span style="color: rgb(229, 87, 87);">Data Completeness</span> (30 pts) — did Emily capture all required fields: member ID, group number, deductible, OOP max, co-pay, prior auth requirement, effective date
- <span style="color: rgb(229, 87, 87);">Conversation Quality</span> (20 pts) — was the call professional, purpose stated correctly, credentials provided when asked
- <span style="color: rgb(229, 87, 87);">Navigation Efficiency</span> (20 pts) — IVR navigated without excessive loops, human rep reached within reasonable time
- <span style="color: rgb(229, 87, 87);">Error Recovery</span> (15 pts) — did Emily handle rep confusion, dead-ends, or incorrect information before hang-up
- <span style="color: rgb(229, 87, 87);">Call Closure</span> (15 pts) — reference number captured, rep name captured, all data confirmed before ending
#### What does GPT-5.1 do

GPT-5.1 is the <span style="color: rgb(229, 87, 87);">**brain**</span> of MOMUS. All the previous steps — transcription, signal metrics, flow check — are data collection. They gather facts about the call. GPT-5.1 takes all those facts, reads them against the rubric, and makes the judgment: what score does this call deserve, what went wrong, at what moment, and what should improve. It acts as a senior QA reviewer who never gets tired, never skips a call, and scores every call against the same standard.

---

#### Problem

Every call our AI agent makes can run 5–45 minutes. Today the only way to know if it went well is to manually listen to it. We have 40 recorded calls in storage with no way to evaluate them at scale.

#### Solution

MOMUS automatically scores a completed call in under 5 minutes — no one needs to listen.

It runs the recording through 5 steps:

1. Listen — pulls the recording from Azure storage
2. Read — ElevenLabs Scribe transcribes the audio, identifying each speaker
3. Measure — detects silences, response times, interruptions, hold duration
4. Check — verifies the agent hit every required call checkpoint
5. Judge — GPT-5.1 scores the call and flags what went wrong and when

Output: a score out of 100, flagged moments with timestamps, and what to improve.

#### Flow Diagram

```
  Completed Call (WAV)
         |
         v
  Azure Blob Storage         -- pull recording
         |
         v
  ElevenLabs Scribe          -- transcribe + label each speaker
         |
         v
  Measure            Flow Check
  - silences         - IVR navigated?
  - latency          - Reached rep?
  - interruptions    - Credentials given?
  - hold time        - Data captured?
                     - Call closed?
         |
         v
  GPT-5.1 (Azure OpenAI)     -- score across 5 dimensions
         |
         v
  Eval Report                -- stored back to Azure
  Score / Flagged Moments / What to Improve
```

---

#### How It Works Technically

When a call completes, Twilio records the audio and sends a notification to HRC's server. The HRC-Outbound-WebApp then downloads the WAV from Twilio and uploads it to Azure Blob Storage — this is already happening in production today. MOMUS reads from there. It runs the following sequence:

1. **Download** — for the POC, MOMUS is a Python script run from the command line with a call's unique ID (`python run_eval.py <call-id>`). In production, it will be called automatically at the end of the existing post-call pipeline after every call completes. MOMUS uses the Azure Blob Storage SDK, constructs the path `calls/<uuid>/voice_recording.wav`, downloads the file, and saves it temporarily for processing.

2. **Transcribe** — the WAV file is sent to ElevenLabs Scribe via a single HTTP POST (multipart/form-data). MOMUS sets `diarize=true` and `num_speakers=3`. Scribe processes the audio and returns every word spoken, which speaker said it, and exact start/end timestamps in seconds. MOMUS then maps the generic speaker labels into roles — agent (Emily), IVR (automated phone system), and rep (human insurance representative). Confirmed: ElevenLabs Scribe accepts WAV files up to 5 GB and supports up to 32 speakers.

3. **Measure** — using only the transcript timestamps (no re-processing of audio), MOMUS calculates: how long the agent took to respond after the rep spoke (latency), any silence longer than 2 seconds (gaps), moments where one speaker cut off another (interruptions), and total time on hold (gaps exceeding 10 seconds).

4. **Flow check** — the transcript text is scanned sequentially against a defined checkpoint list for the carrier. Each checkpoint maps to specific keywords or phrases that must appear in order. For example, checkpoint "reached human rep" passes when the rep speaker first appears after the IVR segment. Every checkpoint is marked pass or fail, with the exact transcript line recorded as evidence.

5. **Judge** — everything collected so far (the full transcript, the signal metrics, and the flow checkpoint results) is packaged into a single document and sent to GPT-5.1 on Azure OpenAI. Alongside it, MOMUS sends a scoring rubric — a set of instructions that tells GPT-5.1 exactly what a good call looks like across 5 dimensions: data completeness, conversation quality, navigation efficiency, error recovery, and call closure. GPT-5.1 reads all of this like a senior QA reviewer reading a case file, and writes back a structured response: a score for each dimension (which add up to 100), a list of specific moments in the call where something went wrong (with the exact timestamp and how serious it was), a summary of what went well, and a list of what to improve.

6. **Store** — the JSON report and a human-readable summary are written back to Azure Blob Storage under a new `evals/<uuid>/eval_report.json` path (created by MOMUS on first run). Nothing is kept on the local machine after the run completes.