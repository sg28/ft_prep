 App / Publisher
     │
     │ HTTP API call → trigger(workflowId, subscriberId/topic, payload, envKey)
     ▼
 Novu API / Bridge Endpoint
     │  └── Auth, validate, route request
     │
     ├── Look up / resolve Subscriber / Topic metadata
     │        (channel identifiers, preferences, etc.)
     │
     └── Enqueue Workflow Job
            (persist in job store / queue for async processing)
     ▼
 Workflow Engine / Execution [ combination of state machine and scheduler ]
     │  (the "state machine" driving notifications)
     │
     ├── Fetch Workflow Definition
     │     - Steps (action or channel)
     │     - Conditions (when to run/skip)
     │     - Versioning (immutable workflow IDs)
     │
     ├── For each Step in definition:
     │     ├── If **Action step** (Delay / Digest / Custom):
     │     │     - Delay → schedule job to resume later
     │     │     - Digest → buffer events, aggregate, then emit
     │     │     - Custom → execute user-defined logic
     │     │
     │     └── If **Channel step** (Email / SMS / Push / In-App / Chat):
     │           - Render template (merge payload + subscriber data)
     │           - Apply subscriber preferences (opt-ins/opt-outs)
     │           - Enqueue channel delivery job → Redis/BullMQ
     │
     ├── Persist execution state
     │     - MongoDB stores current step, success/failure logs
     │     - Enables retries, resumes after crash/restart
     │
     └── Mark workflow as DONE
           or WAITING (if delayed/digest step pending)
     ▼
 Delivery / Channel Workers (via Redis / BullMQ queues)
     │
     ├── Worker picks up channel delivery job
     │
     ├── Check subscriber preference or eligibility for channel
     │
     ├── Invoke provider integration (e.g. SendGrid, Twilio, FCM, Chat API)
     │      │
     │      ├── On success → mark job success (update execution state)
     │      └── On failure → retry with backoff, or fallback to another channel
     │
     └── For In-App / Inbox channel:
            └── Send via WebSocket or push into internal inbox store
     ▼
 Subscriber / Client
     │
     ├── Receives Email / SMS / Push / Chat via provider
     │
     └── For In-App:
           ├── Frontend <Inbox /> component listens on WebSocket or polls
           └── Retrieve / render messages from inbox store










 Event Triggered
   (App / Publisher)
          │
          ▼
 ┌────────────────────────────┐
 │ Novu API / Bridge Endpoint │
 │ - Auth, validate, route    │
 └───────────┬────────────────┘
             │
             ▼
      ┌───────────────┐
      │ MongoDB       │   (fetch subscriber, workflow definition, templates)
      └──────┬────────┘
             │
             ▼
 ┌────────────────────────────┐
 │ Workflow Engine (State Mach)│
 │ - Interpret workflow steps │
 │ - Render email template    │
 │ - Persist execution state  │
 └───────────┬────────────────┘
             │
             ▼
      ┌───────────────┐
      │ Redis/BullMQ  │   (enqueue email delivery job)
      └──────┬────────┘
             │
             ▼
 ┌────────────────────────────┐
 │ Email Worker               │
 │ - Pop job from Redis       │
 │ - Check subscriber prefs   │
 │ - Call provider API        │
 └───────────┬────────────────┘
             │
             ▼
      ┌───────────────┐
      │ Email Provider│   (SendGrid, SES, Postmark, etc.)
      └──────┬────────┘
             │
             ▼
   ┌───────────────────┐
   │ Subscriber Inbox  │
   │ - user@example.com│
   └───────────────────┘
