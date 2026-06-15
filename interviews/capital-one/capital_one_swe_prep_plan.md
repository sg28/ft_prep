# Capital One Software Engineer — Prep Plan

**Target:** Principal Associate / Lead Software Engineer
**Approach:** Topic-based, study to mastery per module
**Updated:** June 14, 2026

---

## 1. Process

```
Recruiter screen (30 min)
  → CodeSignal OA (70 min, 4 questions)
  → Hiring Manager call (sometimes)
  → Power Day — 4 rounds, ~4 hrs:
      • Coding (60 min) — OOP banking
      • System Design (60 min)
      • Tech Case Study (60 min) — code review / debugging
      • Behavioral (45–60 min) — STAR
  → Recruiter debrief → Offer
```

At Lead level: system design + case study weight ≥ coding.

---

## 2. Topic Order (highest ROI first)

### Module A — Banking OOP
- Write the canonical Banking OOP cold (§5 template)
- Write Credit Card variant (§5)
- Write Parking Lot variant (§5)
- **Done when:** all three written in ≤45 min each, 4+ edge cases volunteered, narrating each line

### Module B — CodeSignal OA Drills
- 15 problems across 8 patterns (§3)
- One full timed mock OA
- **Done when:** ≥3 of 4 solved in 70 min on mock, LRU Cache (LC 146) memorized

### Module C — System Design
- Bank Ledger / Wallet (§6)
- Real-Time Fraud Detection (§6)
- Optional: Credit Card Authorization (§6)
- Redo Ledger with pushback questions (§6 follow-ups)
- **Done when:** both designs whiteboarded with API + data model + 5 failure modes, every decision has a stated tradeoff

### Module D — Tech Case Study
- Work through 5 buggy samples (§7)
- 3 business → code translations (§7)
- **Done when:** can state function intent in one sentence within 90 sec, spot 5+ bug categories reliably

### Module E — STAR Stories
- Polish Stories 1–4 (§9), draft 5 (failure) and 6 (conflict)
- Memorize 90-sec pitch
- Rehearse aloud with follow-ups (§8 matrix)
- **Done when:** each story ≤2 min spoken, follow-ups handled without stalling

### Module F — Domain Refreshers
- AWS: S3, DynamoDB, RDS, Kinesis, Lambda, IAM
- Finance: PCI-DSS, ACH/wire flows, double-entry, fraud patterns
- **Done when:** 3 use cases per AWS service, 2-sentence explanation of each finance concept

### Module G — Mock Power Day (do last)
- 4 rounds back-to-back, fresh prompts
- Gap list written immediately after
- Second pass on weak modules

---

## 3. Priority Triage (if time runs short)

Drop in this order:
1. Module F — Domain Refreshers
2. Module C Design 3 (Credit Card)
3. Module A Parking Lot variant
4. Module D buggy samples 4–5
5. Module B → reduce to 10 problems and 1 mock

**Never drop:** Banking OOP core · Bank Ledger design · all 6 STAR stories · 1 mock OA · Module G mock Power Day

---

## 4. CodeSignal OA

**Format:** 4 questions, 70 min. Ramp easy → hard.

**Pacing:**
- Q1+Q2: ≤20 min
- Q3: 20–25 min
- Q4: 25–30 min
- Review: 5 min

**Drill list (15 problems):**

| Pattern | Problems |
|---|---|
| Hashmap counting | First Non-Repeating Char, Append Frequency, Anagram groups |
| Sliding window | Duplicate transactions in N seconds, Longest substring |
| String | String Shift, Radix Addition, Palindrome variants |
| Two pointers | Merge Sorted Lists, Container with most water |
| Stack | Matching Parentheses, Daily Temperatures |
| Tree | Binary Tree Validation, Level Order |
| Intervals | Merge Intervals, Insert Interval |
| Math | Count Primes (Sieve), Prime to N |

**Language:** Python (fastest, fewer footguns). JS/TS if faster for you.

**Pre-OA:** Wired internet · Chrome only (tab-switch flagged) · scratch paper · water · restroom done.

---

## 5. Power Day Coding — Patterns + Templates

**Pattern 1 — Multi-part progressive OOP (dominant):**
- Part 1: CRUD on a class
- Part 2: Cross-entity op
- Part 3: Aggregation / ranking / time-based

Part 1 design dictates Parts 2–3. Build extension-ready: separate entity class, dict lookups, activity counter from line one.

**Pattern 2 — Stateful simulation, not pure algorithm.**

**Pattern 3 — Domain-flavored LeetCode** (sliding window, hashmap top-K, LRU, compound interest, intervals).

**Pattern 4 — Almost never asked:** DP · graphs beyond BFS/DFS · tries · segment trees · bit manipulation.

**Pattern 5 — OA vs Power Day:**

| | OA | Power Day Coding |
|---|---|---|
| Style | Pure LC | OOP / multi-part |
| Difficulty | Easy → hard | Easy-medium |
| Pacing | Tight | Conversational |
| Graded on | Correctness + speed | Communication + edge cases + clean code |

**Pattern 6 — Grading signals:**
1. Clarifying questions before writing
2. Edge cases volunteered, not extracted
3. Talk through every line
4. "I'd do this differently in production"
5. Ask before optimizing

### Template 1 — Banking OOP

```python
class Bank:
    def __init__(self):
        self.accounts = {}          # id -> Account
        self.activity_count = {}    # id -> int
        self.transactions = []      # audit / scheduled

    def create_account(self, account_id: str) -> bool:
        if account_id in self.accounts:
            return False
        self.accounts[account_id] = Account(account_id)
        self.activity_count[account_id] = 0
        return True

    def deposit(self, account_id: str, amount: int) -> int:
        if account_id not in self.accounts or amount <= 0:
            return -1
        self.accounts[account_id].balance += amount
        self.activity_count[account_id] += 1
        return self.accounts[account_id].balance

    def withdraw(self, account_id: str, amount: int) -> int:
        if account_id not in self.accounts or amount <= 0:
            return -1
        acct = self.accounts[account_id]
        if acct.balance < amount:
            return -1
        acct.balance -= amount
        self.activity_count[account_id] += 1
        return acct.balance

    def transfer(self, from_id: str, to_id: str, amount: int) -> int:
        if from_id == to_id:
            return -1
        if from_id not in self.accounts or to_id not in self.accounts:
            return -1
        if amount <= 0 or self.accounts[from_id].balance < amount:
            return -1
        self.accounts[from_id].balance -= amount
        self.accounts[to_id].balance += amount
        self.activity_count[from_id] += 1
        return self.accounts[from_id].balance

    def top_k_active(self, k: int) -> list:
        return sorted(
            self.activity_count.items(),
            key=lambda x: (-x[1], x[0])
        )[:k]


class Account:
    def __init__(self, account_id: str):
        self.id = account_id
        self.balance = 0
```

**Clarifying questions:** Amounts positive int? Transfer atomic? Timestamps needed? Top-K tie-break?
**Edge cases:** negative amount · self-transfer · missing account · insufficient funds

### Template 2 — Credit Card System (variant)

```python
import time

class CreditCardSystem:
    def __init__(self):
        self.cards = {}              # id -> Card
        self.transactions = []       # (card_id, amt, kind, ts)
        self.activity_count = {}     # id -> int

    def issue(self, card_id: str, limit: int) -> bool:
        if card_id in self.cards or limit <= 0:
            return False
        self.cards[card_id] = Card(card_id, limit)
        self.activity_count[card_id] = 0
        return True

    def charge(self, card_id: str, amount: int) -> int:
        if card_id not in self.cards or amount <= 0:
            return -1
        card = self.cards[card_id]
        if card.balance + amount > card.limit:
            return -1
        card.balance += amount
        self.activity_count[card_id] += 1
        self.transactions.append((card_id, amount, "charge", time.time()))
        return card.balance

    def pay(self, card_id: str, amount: int) -> int:
        if card_id not in self.cards or amount <= 0:
            return -1
        card = self.cards[card_id]
        paid = min(amount, card.balance)
        card.balance -= paid
        self.activity_count[card_id] += 1
        self.transactions.append((card_id, paid, "pay", time.time()))
        return card.balance

    def stats_last_n_days(self, card_id: str, n: int) -> int:
        if card_id not in self.cards:
            return -1
        cutoff = time.time() - (n * 86400)
        return sum(1 for t in self.transactions
                   if t[0] == card_id and t[3] >= cutoff and t[2] == "charge")

    def top_k_spenders(self, k: int) -> list:
        spend = {}
        for cid, amt, kind, _ in self.transactions:
            if kind == "charge":
                spend[cid] = spend.get(cid, 0) + amt
        return sorted(spend.items(), key=lambda x: (-x[1], x[0]))[:k]


class Card:
    def __init__(self, card_id: str, limit: int):
        self.id = card_id
        self.limit = limit
        self.balance = 0  # outstanding owed
```

**Variant-specific clarifications:** Credit limit hard cap? Overpayment refund or just zero out? Stats by charge only or net spend?

### Template 3 — Parking Lot (variant)

```python
class ParkingLot:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.spots = [None] * capacity   # index -> license_plate or None
        self.vehicles = {}               # plate -> spot_index
        self.next_free = 0

    def park(self, plate: str) -> int:
        if plate in self.vehicles:
            return -1
        if len(self.vehicles) >= self.capacity:
            return -1
        # Linear scan; for huge lots use a heap or sorted set
        for i in range(self.capacity):
            if self.spots[i] is None:
                self.spots[i] = plate
                self.vehicles[plate] = i
                return i
        return -1

    def leave(self, plate: str) -> int:
        if plate not in self.vehicles:
            return -1
        idx = self.vehicles[plate]
        self.spots[idx] = None
        del self.vehicles[plate]
        return idx

    def occupancy(self) -> int:
        return len(self.vehicles)

    def is_full(self) -> bool:
        return len(self.vehicles) >= self.capacity
```

**Variant-specific clarifications:** Vehicle sizes/spot types? Pricing model? Multi-floor?

**Practice protocol per template:**
- [ ] Part 1 cold, no reference, 15 min
- [ ] Parts 1–2 talking aloud, 30 min
- [ ] Parts 1–3 recorded, 45 min

---

## 6. System Design

**Framework (every prompt):**
1. Clarify requirements (users, RPS, R/W ratio, latency, consistency)
2. Define API
3. Data model (entities, relationships, indexes)
4. High-level architecture
5. Deep-dive 1–2 components
6. Failure modes (detect + recover)
7. Tradeoffs explicit

### Design 1 — Bank Ledger / Wallet

**Prompt:** "Design a backend service that stores and updates user account balances. Must be highly reliable."

**Numbers to anchor on:**
- 100M users · 10K TPS peak writes · 100K TPS peak reads · <100ms P99 read · <500ms P99 write
- Storage: ~100GB/year for ledger entries at 10K TPS
- Read:write skew ~10:1

**API:**
```
POST /accounts                          → create account
POST /accounts/{id}/credit              → idempotent, body: {amount, currency, txn_id}
POST /accounts/{id}/debit               → idempotent, body: {amount, currency, txn_id}
POST /transfers                         → atomic, body: {from, to, amount, txn_id}
GET  /accounts/{id}/balance             → current balance
GET  /accounts/{id}/transactions?from=  → paginated history
```

**Data model (Postgres):**
```
accounts(id PK, user_id, currency, status, created_at)
ledger_entries(id PK, txn_id FK, account_id FK, amount, direction, created_at)
   -- amount as bigint in smallest unit (cents); never float
   -- direction: 'debit' | 'credit'; per-txn entries sum to zero
transactions(id PK, txn_id UNIQUE, status, created_at, idempotency_key UNIQUE)
balances(account_id PK, balance bigint, updated_at, version)
   -- materialized; updated in same tx as ledger_entries
outbox(id PK, event_type, payload, published_at NULL)
```

**Sequence — transfer A→B:**
```
1. Client POST /transfers with idempotency_key
2. Check transactions table for existing key → return cached result if found
3. BEGIN tx
4.   Insert transactions row (status=pending)
5.   Insert 2 ledger_entries: debit A, credit B
6.   UPDATE balances SET balance=balance-amt WHERE account_id=A AND balance>=amt
       → if 0 rows affected → ROLLBACK, return 422 insufficient funds
7.   UPDATE balances SET balance=balance+amt WHERE account_id=B
8.   Insert outbox row (event=transfer_completed)
9.   UPDATE transactions SET status=committed
10.  COMMIT
11. Outbox worker publishes event to Kafka (at-least-once)
12. Downstream consumers (analytics, notifications) process event idempotently
```

**Key concepts:**
- Double-entry: every txn = matching debit + credit; sum across entries = 0; auditable
- Idempotency keys with TTL (24h); same key returns cached response
- ACID Postgres primary; read replicas for queries (eventually consistent — disclose in API docs)
- Outbox pattern guarantees event publication
- Reconciliation job: nightly sweep verifies SUM(ledger_entries.signed_amount) per account == balances.balance
- Sharding: by account_id hash when single primary hits ceiling (~50K TPS)
- Currency precision: bigint cents only, never float

**Failure modes:**
| Failure | Detection | Recovery |
|---|---|---|
| Network partition mid-transfer | Client retries with same idempotency_key | Returns committed result, no double-charge |
| Replay attack | Idempotency key TTL + replay log | Reject after TTL |
| Hot account (merchant) | Lock contention metrics | Partition account or async queue |
| Lost outbox event | Outbox row with `published_at=NULL` after 60s | Worker retries; alarm if backlog grows |
| Replica lag | Lag metric exceeds 1s | Force balance reads to primary |
| Currency rounding | Float anywhere triggers test failure | bigint cents, never divide |

**Likely follow-up questions and your answers:**
- *"How would you handle multi-currency transfers?"* → Two ledger entries per leg (debit source currency, credit dest currency) plus FX entry; lock both rates at txn time.
- *"What if Postgres goes down?"* → Synchronous replica with auto-failover (~30s); reads degrade to read-only mode; writes queue at app layer with bounded buffer.
- *"How does this scale to 1M TPS?"* → Shard by account_id; each shard owns its accounts exclusively; cross-shard transfers use saga pattern with compensating txns.
- *"How do you handle disputes / reversals?"* → Never delete entries; post reversing entries with reference to original txn. Audit log preserved.

### Design 2 — Real-Time Fraud Detection

**Prompt:** "Design a system that scores credit card transactions in real time for fraud."

**Numbers:**
- 100K TPS transaction stream · <100ms P99 decision latency · 99.99% availability
- ~50ms feature lookup budget · ~30ms model inference budget · ~20ms decision logic

**API:**
```
POST /score
  body: {txn_id, card_id, amount, merchant, geo, channel, ts}
  response: {decision: approve|decline|step_up, score: 0-1, reason_codes: []}
```

**Components:**
```
Card Networks
     ↓
   Kafka (partitioned by card_id, retention 7d)
     ↓                              ↓
[Scoring Service]            [Stream Processor (Flink)]
     ↓                              ↓
[Feature Store: Redis]    [Feature Store: S3/Parquet]
     ↓
[Rules Engine] + [ML Model (gradient boost / sequence)]
     ↓
[Decision Service: combine, decide]
     ↓
Approve / Decline / Step-up MFA
     ↓
[Feedback: analyst overrides, chargebacks]
     ↓
[Retraining pipeline] → new model → shadow mode → live
```

**Online features (Redis, sub-ms reads):**
- last_txn_geo (card_id)
- txn_count_1m, txn_count_5m, txn_count_1h (sliding windows)
- amount_sum_1h
- distinct_merchant_count_1h
- distance_from_last_geo

**Offline features (S3/Parquet, retrained daily):**
- card lifetime spend percentiles
- merchant category baseline
- time-of-day pattern

**Tradeoffs:**
- False positive (decline real customer) vs false negative (allow fraud) — tune threshold per merchant category
- Latency vs accuracy — deeper model = slower; use cascade: fast rules block obvious fraud, deeper model on ambiguous
- Online vs offline features — fresh but expensive vs rich but stale
- Synchronous score vs async approve-then-flag — synchronous loses some recall but customer experience matters

**Failure modes:**
| Failure | Recovery |
|---|---|
| Feature store down | Fail open with rules-only scoring; alarm |
| Model serving down | Fallback model in memory; rules-only |
| Kafka lag > 5s | Score on partial features; alarm |
| Model drift | PSI / KL divergence per feature; auto-trigger retrain |
| Bad model deploy | Shadow mode + automatic rollback on lift drop |

**Follow-ups:**
- *"How do you measure success?"* → Approval rate, fraud loss rate, customer escalation rate. Hold out a control population to measure incremental fraud caught.
- *"How do you avoid bias?"* → Audit reason codes for protected attributes; fairness metrics in eval; remove proxies (zip code → income).
- *"What if a model trained on bad labels?"* → Label-quality eval before promotion; rollback if shadow lift looks wrong.

### Design 3 — Credit Card Authorization (fold into Ledger discussion if time-short)

**Components:**
- Application service (KYC + credit decisioning + bureau pull)
- Card management (issue, freeze, replace, tokenization)
- Authorization service (real-time, <100ms, calls fraud + limit check)
- Statement service (batch nightly + on-demand)
- Payment service (Plaid or banking partner integration)
- Notification service

**Auth flow:**
```
Merchant POS → Network → C1 Auth Service
  → Fraud score
  → Limit check (available_credit ≥ amount?)
  → Velocity check
  → Approve/decline → ledger hold (not posted) → response
Posting flow (later, batch): hold → posted entry in ledger
```

---

## 7. Tech Case Study

**Format:** code review / debugging + business reasoning.

**Per sample:**
1. Read silently 2 min
2. State function purpose in one sentence
3. List bugs specifically ("line 12 mutates input")
4. Rewrite cleaner
5. State time/space complexity

**Bug categories to scan for:** off-by-one · mutation of input · missing null/empty checks · redundant branches / dead else · wrong loop bounds · float comparison · resource leaks · race conditions · wrong data structure · magic numbers

### Sample 1 — Fee Calculation

```python
def calculate_late_fee(balance, days_late, customer_type):
    fee = 0
    if days_late > 0:
        if customer_type == "premium":
            fee = balance * 0.01
        elif customer_type == "regular":
            fee = balance * 0.02
        else:
            fee = balance * 0.02
        if days_late > 30:
            fee = fee * 2
        elif days_late > 60:
            fee = fee * 3
    return fee
```

**Purpose:** Calculate late fee based on balance, days overdue, and customer tier.
**Bugs:** (1) `days_late > 60` branch unreachable — `> 30` swallows it. (2) Premium and regular both 2% if customer_type matches neither premium nor regular — duplicate branches. (3) Float math on currency. (4) No cap on fee. (5) No validation of negative balance or days_late.

**Refactor:**
```python
from decimal import Decimal

LATE_FEE_RATES = {"premium": Decimal("0.01"), "regular": Decimal("0.02")}
DEFAULT_RATE = Decimal("0.02")
MAX_FEE_MULTIPLIER = 3

def calculate_late_fee(balance_cents: int, days_late: int, customer_type: str) -> int:
    if balance_cents <= 0 or days_late <= 0:
        return 0
    rate = LATE_FEE_RATES.get(customer_type, DEFAULT_RATE)
    base = Decimal(balance_cents) * rate
    multiplier = 3 if days_late > 60 else 2 if days_late > 30 else 1
    return int(base * multiplier)
```

**Complexity:** O(1) time and space.

### Sample 2 — Transaction Dedup

```python
def remove_duplicates(transactions):
    seen = []
    for t in transactions:
        if t not in seen:
            seen.append(t)
    return seen
```

**Purpose:** Remove duplicate transactions from a list.
**Bugs:** (1) `t not in seen` on a list is O(n) — total O(n²). (2) Mutates nothing but returns a new list while name suggests in-place. (3) No definition of duplicate — exact match? same txn_id? (4) Order preservation unclear.

**Refactor:**
```python
def remove_duplicate_transactions(transactions: list[dict]) -> list[dict]:
    """Return transactions with duplicates removed by txn_id, preserving order."""
    seen_ids = set()
    result = []
    for t in transactions:
        if t["txn_id"] not in seen_ids:
            seen_ids.add(t["txn_id"])
            result.append(t)
    return result
```

**Complexity:** O(n) time, O(n) space.

### Sample 3 — Balance Update

```python
def update_balance(account, amount):
    account["balance"] = account["balance"] + amount
    if account["balance"] < 0:
        account["balance"] = 0
    return account
```

**Purpose:** Add amount to balance, clamping at zero.
**Bugs:** (1) Silently swallows overdrafts — caller can't tell if amount was applied. (2) No idempotency; replay double-charges. (3) Mutates input — dangerous in concurrent code. (4) No type or sign checks. (5) Returns the whole account, leaking internal state.

**Refactor:**
```python
def apply_balance_change(
    account: dict,
    amount_cents: int,
    txn_id: str,
    seen_txns: set
) -> tuple[bool, int]:
    """
    Returns (success, new_balance_cents).
    Idempotent on txn_id. Rejects overdrafts instead of clamping.
    """
    if txn_id in seen_txns:
        return True, account["balance"]
    new_balance = account["balance"] + amount_cents
    if new_balance < 0:
        return False, account["balance"]
    account["balance"] = new_balance
    seen_txns.add(txn_id)
    return True, new_balance
```

**Complexity:** O(1) time, O(1) space (excluding `seen_txns` growth).

### Sample 4 — Tier Discount

```python
def apply_discount(price, customer):
    discount = 0
    if customer.tier == "gold":
        discount = 0.15
    if customer.tier == "silver":
        discount = 0.10
    if customer.tenure_months > 12:
        discount = discount + 0.05
    return price - (price * discount)
```

**Purpose:** Apply tier-based discount with tenure bonus.
**Bugs:** (1) Three separate `if`s instead of elif — works only because tiers are mutually exclusive but fragile. (2) No cap on stacked discount (could exceed 100% with new tiers added). (3) Float math on price. (4) No null check on customer. (5) Bronze/no-tier customer with tenure > 12 gets 5% with no base.

**Refactor:**
```python
from decimal import Decimal

TIER_DISCOUNTS = {
    "gold": Decimal("0.15"),
    "silver": Decimal("0.10"),
    "bronze": Decimal("0.05"),
}
TENURE_BONUS = Decimal("0.05")
MAX_DISCOUNT = Decimal("0.50")

def apply_discount(price_cents: int, customer) -> int:
    if customer is None or price_cents <= 0:
        return price_cents
    base = TIER_DISCOUNTS.get(customer.tier, Decimal(0))
    bonus = TENURE_BONUS if customer.tenure_months > 12 and base > 0 else Decimal(0)
    total = min(base + bonus, MAX_DISCOUNT)
    return int(Decimal(price_cents) * (Decimal(1) - total))
```

**Complexity:** O(1).

### Sample 5 — Top Spenders

```python
def get_top_spenders(transactions, n):
    totals = {}
    for t in transactions:
        if t.user in totals:
            totals[t.user] += t.amount
        else:
            totals[t.user] = t.amount
    sorted_users = sorted(totals.items(), key=lambda x: x[1])
    return sorted_users[:n]
```

**Purpose:** Return top N users by total transaction amount.
**Bugs:** (1) Sorts ascending — returns the *lowest* spenders. (2) No tie-break — non-deterministic on equal totals. (3) No handling of `n <= 0` or `n > len(totals)`. (4) Counts all txns including refunds/declines.

**Refactor:**
```python
import heapq

def get_top_spenders(transactions: list, n: int) -> list[tuple[str, int]]:
    if n <= 0:
        return []
    totals: dict[str, int] = {}
    for t in transactions:
        if t.status != "settled" or t.amount <= 0:
            continue
        totals[t.user] = totals.get(t.user, 0) + t.amount
    if n >= len(totals):
        return sorted(totals.items(), key=lambda x: (-x[1], x[0]))
    return heapq.nlargest(n, totals.items(), key=lambda x: (x[1], -ord(x[0][0])))
```

**Complexity:** O(m + k log n) where m = txns, k = unique users, n = result size.

### Business → code translations

- "Customers with > 6 mo tenure pay 10% less" → tenure check + Decimal multiplier
- "Daily compounding APR" → `balance *= (1 + Decimal(apr)/365)` per day; never float
- "Skip fee if autopay enrolled" → flag check, document precedence
- "Apply higher of tier or promo discount, not both" → `max(tier_d, promo_d)` not sum
- "Cashback capped at $500/month" → running total per month, clamp at cap

---

## 8. Behavioral

**Capital One values:**
1. Excellence
2. Do the Right Thing
3. Deliver for Customers / Champion the Customer
4. Work Together
5. Diversity & Inclusion

**Question → Story map:**

| Question | Story |
|---|---|
| Tell me about yourself | 90-sec pitch |
| Why Capital One? | Research-backed |
| Most challenging technical project | 1 or 3 |
| Disagreed with manager | 6 |
| Failure / mistake | 5 |
| Took initiative unasked | 4 |
| Delivered for customer | 1 |
| Saved money / improved efficiency | 2 |
| Difficult stakeholders | 3 or 6 |

### 90-sec pitch

> "Software engineer, 10+ years, building user-facing web apps at scale — frontend platforms, design systems, developer tooling. Last two years expanded into applied AI: led an OCR + RAG document intelligence platform that cut retrieval time 85% and lifted productivity 25%. Drawn to Capital One because fintech is one of the few domains where engineering decisions directly shape customer trust and AI is moving prototype → production. Looking for a Lead role to own end-to-end systems."

### Follow-up question matrix

For each story, prep answers to these — interviewers always dig deeper than the headline:

| Follow-up | What they're testing |
|---|---|
| What was your *specific* contribution vs the team's? | Are you taking credit for group work? |
| What would you do differently? | Self-awareness, learning |
| How did you measure success? | Outcomes orientation |
| What was the hardest part technically? | Depth |
| How did stakeholders react? Anyone push back? | Influence, conflict handling |
| What did your manager think? | Self-perception calibration |
| If you had half the time, what would you cut? | Prioritization |
| Walk me through your first week on this | Concreteness check |

### Why Capital One — research scaffold

Don't say "fintech is interesting." Research and reference 2–3 of these specifics:

- C1's AI assistant **Eno** — virtual assistant for cards, fraud alerts. Real production AI in fintech.
- C1's **cloud-first migration** — fully closed last data center 2020. Engineering culture more like tech than bank.
- Recent AI/ML announcements — search "Capital One AI 2026" before the interview.
- **Your specific team's domain** — ask the recruiter what the team builds.

Sample answer structure:
> "Three reasons. First, Capital One is one of the few large financial institutions that's genuinely engineering-led — closing all data centers and going cloud-first was a real engineering bet. Second, the work I want to do — applied AI in production, not prototypes — actually exists here at scale; Eno and your fraud platforms are real products serving real customers. Third, I want to work where engineering decisions move customer trust, not ad impressions. Fintech does that. What's your team's most active AI investment right now?"

### Strengths and Weaknesses

**Strength (pick 1, with evidence):**
- *Cross-functional translation:* I'm comfortable bridging product, design, security, and platform engineering. Last year I led a developer portal program across 8+ teams and the hardest part wasn't the engineering, it was aligning what "golden path" meant. I brought them to consensus and shipped.

**Weakness (real, with mitigation):**
- *I default to building rather than evaluating:* When I see a problem I tend to start prototyping before fully scoping alternatives. I've worked on this by forcing myself to write a one-page tech spec listing options + tradeoffs before any code. The Strapi CMS evaluation is an example — I made myself evaluate 4 options before committing, which I wouldn't have done two years ago.

**Avoid:** "I work too hard." "I'm a perfectionist." "I care too much." These read as evasive.

### Common pitfalls in behavioral rounds

- **"We" instead of "I"** — interviewers will press for your specific contribution
- **No numbers** — "improved performance" vs "cut p99 latency from 800ms to 120ms"
- **No reflection** — every story should end with what you learned or would do differently
- **Naming colleagues badly** — never trash a former teammate, manager, or company
- **Overrunning** — 2 min max per story; longer signals poor self-editing

---

## 9. STAR Bank

### Story 1 — Customer Impact (RAG / OCR)
- **S:** Engineering teams losing 10–15 min per doc lookup
- **T:** Lead AI-powered document intelligence platform
- **A:** OCR pipeline + embeddings + vector store + RAG with re-ranking. Benchmarked 3 embedding models. Analyst feedback loop. Integrated into developer portal.
- **R:** 85% retrieval reduction · 40% accuracy gain · 25% productivity gain
- **Maps:** Deliver for Customers, Excellence
- **Likely follow-ups:** Which embedding model and why? How did you measure accuracy? What happens when RAG returns wrong info?

### Story 2 — Cost Discipline (CMS Migration)
- **S:** Heavy AEM licensing, slow content workflows
- **T:** Lead eval + migration
- **A:** Evaluated options, picked Strapi, zero-downtime migration, custom plugins, two-phase rollout
- **R:** $100K+ annual savings · publish days → hours · zero rollback
- **Maps:** Excellence, Do the Right Thing
- **Likely follow-ups:** What other options did you consider and why reject? What broke during migration? Who pushed back?

### Story 3 — Cross-functional Leadership (IDP)
- **S:** Devs spending 30–50% time on infra setup
- **T:** Lead frontend architecture for unified developer portal
- **A:** Partnered platform/security/product across 8+ teams. Reusable module system. Pushed back on per-team scope creep.
- **R:** 20–40% reduction in repetitive work · 30–70% faster onboarding · service creation weeks → minutes
- **Maps:** Work Together, Excellence
- **Likely follow-ups:** Which team was hardest to align with? How did you handle the team that wanted bespoke UI?

### Story 4 — Initiative (Notification Service)
- **S:** Third-party email provider — cost, deliverability, SPOF
- **T:** Self-assigned
- **A:** Prototyped Novu + internal SMTP as shared service. Shadow validation. Migration runbook.
- **R:** $5K–10K+ savings · 4 platforms adopted next quarter
- **Maps:** Do the Right Thing, Excellence
- **Likely follow-ups:** How did you sell it to leadership? What if it had failed in production?

### Story 5 — Failure / Learning (TO DRAFT)

**Criteria:** You owned it · real consequences · behavior changed after.

**Strong patterns:**
- Shipped a bug that caused real damage (data loss, customer escalation, missed SLO)
- Picked the wrong technical approach and had to rewrite mid-stream
- Over-committed on a deadline and missed
- Mishandled a stakeholder, lost their trust

**Structure:**
- *Situation:* what was at stake
- *Task:* what you were responsible for
- *Action:* what you did, including the wrong call
- *Result:* the actual damage, owned squarely
- *Learning:* the specific behavioral change since (not vague "I learned to communicate")

**Avoid:**
- Failures that aren't really failures ("I worked too hard and burned out")
- Blaming the team or manager
- Failures with no learning attached

### Story 6 — Conflict / Disagreement (TO DRAFT)

**Criteria:** Disagreed with senior or peer · navigated professionally · good outcome (even if not your way).

**Strong patterns:**
- Pushed back on a technical decision with data, got the call reversed or compromise reached
- Disagreed with manager on scope/timeline, surfaced it instead of grinding
- Conflicting demands from two stakeholders, brokered alignment

**Structure:**
- Set up the disagreement clearly (positions, what was at stake)
- Show you brought data, not just opinions
- Show you stayed professional even when you didn't get your way
- End with the outcome — if you "won," show humility; if you "lost," show you committed

**Avoid:**
- Framing the other person as wrong/foolish
- "I was right and they were wrong" without nuance
- Stories with no real conflict ("we politely discussed and aligned")

---

## 10. Compensation

**Research (do this before any number conversation):**
- Levels.fyi → "Capital One" → Lead / Principal Associate / your region
- Glassdoor C1 salaries
- Blind search: "Capital One Principal Associate offer"
- Recent (last 6 months) data only — comp shifts

**Likely band (Lead / Principal Associate, Seattle/Redmond):**
- Base: $200K–$240K
- Bonus target: 15–25%
- Sign-on: $25K–$60K
- RSUs: $30K–$80K/yr (C1 is more cash-heavy than big tech)

**Target:** $220K base · $50K sign-on · $50K RSU/yr · ~$320K total Y1

### Negotiation principles

1. Never give a number first
2. Have a competing offer if humanly possible
3. Negotiate total comp, not just base
4. Get it in writing before accepting
5. Don't decline current processes for a verbal pitch

### Negotiation scripts

**Recruiter asks for your number:**
> "I'm focused on finding the right role and level first; I'd rather understand what Capital One typically offers for this level before naming a number. What's the band for Principal Associate in this region?"

**Recruiter offers below band:**
> "Thanks for the offer. Based on what I'm seeing on Levels.fyi and from other companies I'm in process with, the market for someone with my background at this level is closer to $X base. Is there room to revisit?"

**Pushing on sign-on:**
> "I'm walking away from unvested equity and a current bonus cycle. To make this an easy yes, I'd need the sign-on closer to $X. That bridges the gap on Year 1 comp."

**Pushing on RSUs:**
> "I noticed the RSU package is on the lower end. Given the long-term tenure I'm planning here, could we move that up by 20%? It signals long-term alignment from both sides."

**Multiple offers leverage:**
> "I have another offer at $X total comp from [Company]. I'd genuinely rather take this role, but I need the numbers to be in the same ballpark. Can you take another look?"

**They say "this is our best":**
> "Understood. Let me think about it and come back tomorrow. Could you send the full offer breakdown in writing in the meantime?"

**Closing:**
> "If we can land at $X base, $Y sign-on, and $Z RSUs, I'm ready to accept today. Can we get there?"

### Red lines (walk if)

- Below band base (e.g. <$180K for Lead in Seattle)
- Title downgrade from what you interviewed for
- No equity at all (rare at C1 but signals undervaluation)

---

## 11. Recruiter Screen Script

The first call sets your level, comp band, and what they tell the panel.

**They will ask:**

- *"Walk me through your background"* → 90-sec pitch
- *"What are you looking for?"* → "Lead role, end-to-end ownership, fintech or applied AI." Don't say "anything I can get."
- *"What's your current comp?"* → "I'd rather discuss the range for this role first." If pressed: give total comp, not base.
- *"What's your target?"* → "I'm interviewing at several companies in the $X–$Y total comp range, but the role fit matters more to me than maxing a number."
- *"Why are you looking?"* → Positive framing only. Never trash current employer. "Looking to own more end-to-end systems, lean into applied AI in production."

**You should ask:**

- "What level is this role posted at internally?" (gets you to "Principal Associate" vs "Senior Associate" clarity)
- "What's the comp band for this level in this region?"
- "Who will be on Power Day and what does each round focus on?"
- "What's the typical timeline from Power Day to offer?"
- "Is this a backfill or new headcount?" (new = more flexibility; backfill = role is shaped)

---

## 12. Interviewer Questions (for you to ask them)

End every round with 1–2. Don't repeat across rounds.

**Engineers:**
- Path from prototype to production for AI/ML projects here?
- Where does engineering autonomy stop and platform/governance begin?
- Most surprising thing about working here?
- What's the on-call burden like for this team?

**Hiring manager:**
- What does "great" look like at 6 months? 12 months?
- Biggest unsolved technical problem on your team right now?
- Team composition — senior/junior mix, locations, time zones?
- What's the team's relationship with product and design?

**Recruiter:**
- Offer + decision timeline?
- Typical comp range for this level?
- Power Day panel composition and focus areas?

---

## 13. Day-of Checklist

**Night before:**
- [ ] Confirm Zoom links + interviewer names
- [ ] Test camera, mic, internet
- [ ] Lay out water, notepad, pen, charged laptop + charger
- [ ] Read STARs once, then put away
- [ ] Sleep 8 hrs

**Morning:**
- [ ] Protein-heavy breakfast
- [ ] Re-read Banking OOP template once
- [ ] Re-read 3 system design key concepts
- [ ] Restroom + water before each round

**Between rounds:**
- [ ] 5-min reset
- [ ] Don't replay previous round

---

## 14. Resources

| Resource | For | Cost |
|---|---|---|
| LeetCode C1 tagged | OA prep | Free / Premium $35/mo |
| Designing Data-Intensive Applications | System design | Own |
| Levels.fyi | Comp research | Free |
| Glassdoor C1 interviews | Question recon | Free |
| Blind | Salary + culture | Free |
| Interview Query C1 guide | Verified questions | Free tier |
| Prepfully C1 guide | Process details | Free |

---

## 15. How to Practice This Plan

### Core principles

1. **Active recall over re-reading.** Close the doc, reproduce from blank.
2. **Verbalize everything.** If you can't explain it aloud, you don't know it.
3. **Time-box every drill.** Pressure exposes the gaps.
4. **Record at least once per module.** Listen back; you'll hear what interviewers hear.
5. **Spaced repetition.** Revisit each module at 24h, 72h, and 1wk after first pass.

### Per-module practice protocol

**Module A — Banking OOP (3 templates)**

For each of Banking, Credit Card, Parking Lot:
- **Pass 1 (study):** Read template, trace each method, understand why each clarifying question + edge case exists. ~15 min.
- **Pass 2 (recall):** Close doc. Blank file. Write Part 1 from scratch. Compare. Note misses. 15 min.
- **Pass 3 (full):** Close doc. Write Parts 1–3 talking aloud. Record. 30–45 min.
- **Pass 4 (variant pressure):** Without looking, write the OOP for a new domain ("hotel booking system" / "library / file storage"). 30 min.

Compare to template only *after* each pass, not during.

**Module B — CodeSignal OA**

- Solve each pattern's first problem untimed to learn it (~30 min each)
- Redo all 15 timed (8–12 min each) in one block
- One full mock OA: 4 unseen problems, 70 min, on a real timer
- Review every miss with a 1-line root cause: pattern unknown / pacing / careless

**Module C — System Design**

For each design:
- **Pass 1:** Read design + concepts. Understand the why, don't memorize.
- **Pass 2:** Open Excalidraw or whiteboard. Without looking, draw architecture + API + data model. 45 min.
- **Pass 3:** Talk through your whiteboard aloud, recorded. 30 min.
- **Pass 4:** Cold drill — have someone (or a separate AI session) ask the §6 follow-up questions. Answer without preparation.

**Module D — Case Study**

- For each sample: cover the bugs/refactor sections. Read only the function. Write your own bug list + refactor. 15 min.
- Compare. Note bugs *and bug categories* you missed (e.g. "I always miss float-comparison").
- After 5 samples, find 5 new ones (LeetCode review-this-code problems or ask me for fresh ones).

**Module E — STAR Stories**

- Write each out longhand
- Record on phone voice memo, time it
- Listen back: filler words, pacing, missing numbers, missing reflection
- Re-record until under 2 min
- Drill the §8 follow-up matrix cold with a partner or AI session

**Module F — Domain Refreshers**

- AWS: write your own one-pagers, don't read marketing pages. Per service: 2-sentence what-it-is, 3 use cases, 1 gotcha.
- Finance: explain each in 2 sentences as if to a non-engineer. If you can't, you don't know it.

**Module G — Mock Power Day**

Real 4-hour block. No phone. No tabs except IDE.
- 60 min coding (Banking variant you haven't drilled, e.g. file storage)
- 5 min break
- 60 min system design (fresh prompt, e.g. "design peer-to-peer payments")
- 5 min break
- 60 min case study (fresh buggy code)
- 5 min break
- 45 min behavioral with a partner playing interviewer

Immediately after: write a gap list. Those gaps are your remaining focus.

### Tools (mostly free)

| Need | Free option | Paid option |
|---|---|---|
| Timed problems | leetcode.com built-in timer | LeetCode Premium $35/mo |
| Mock interviewer | 2nd AI session in another tab | Interviewing.io, Pramp, Exponent |
| Whiteboard | Excalidraw, tldraw, paper + phone camera | Miro |
| Recording | Phone voice memo | — |
| Code execution | Local IDE | CoderPad trial |

### AI mock interviewer prompts

Paste into a fresh AI chat (Claude, ChatGPT, whatever):

**Technical round:**
> "You are a Capital One Principal Software Engineer interviewer running the [coding / system design / case study] round of a Power Day. Ask me a round-appropriate question, then push back with follow-ups based on my answers. When my answers are vague or missing tradeoffs, call it out. Don't give me the answer; make me work. Start now."

**Behavioral round:**
> "You are a Capital One behavioral interviewer. Ask me one behavioral question, then ask 3–4 follow-up questions that dig into my specific contribution, what I'd do differently, and how I measured success. After my answer, give brief feedback on what was weak. Don't be soft."

### Common practice mistakes

- Reading the solution before attempting — defeats recall
- Practicing silent — real rounds are spoken
- Skipping the timed phase — creates false confidence
- No follow-up drilling — you'll freeze on the second question
- Not recording — you can't hear your own filler words
- Cramming — spaced sessions (24h/72h/1wk gaps) beat marathons

### Weekly cadence (no day structure — just rhythm)

- **Daily:** 1 OA problem timed (~15 min) + rehearse 1 STAR aloud (~3 min)
- **3–4x per week:** One full OOP template or system design (45–60 min)
- **2x per week:** Case study drill (1 buggy sample, 15–20 min)
- **1x per week:** Long block — mock interview or domain refresher (1–2 hrs)
- **Once total (few days before Power Day):** Full mock Power Day (4 hrs)
