# System Design Answer — Peer-to-Peer Payments (Mock Power Day Prompt)

**Source:** §15 Module G lists this as a suggested fresh prompt for mock Power Day practice — no answer existed in the original plan. This is a full answer drafted from scratch using the same framework as the other two designs, so there's a third rehearsed design ready if this (or something similar, e.g. "design Venmo/Zelle") comes up.

**Prompt (as given in the plan):** "Design peer-to-peer payments."

## 1. Clarify Requirements

- **Scale (reasonable assumption to state and confirm):** tens of millions of users, moderate TPS (P2P transfer volume is much lower than card-swipe volume) — say 5K TPS peak
- **Latency:** transfer should feel instant to the user (<1s end-to-end), even though underlying bank rails (ACH) settle in days
- **Consistency:** strong consistency on balance — this reuses the Bank Ledger design's core guarantee
- **Key question to ask the interviewer:** is money moving between two internal wallet balances (like Venmo holding a balance) or directly bank-account-to-bank-account (like Zelle, no held balance)? This changes the whole design — assume the Venmo-style internal-wallet model, since it's the more interesting design.

## 2. API

```
POST /p2p/transfers
  body: {from_user, to_user, amount, currency, idempotency_key, memo}
  response: {status: pending|completed|failed, transfer_id}
GET  /p2p/transfers/{id}
GET  /users/{id}/wallet/balance
POST /wallet/topup        → pull money from linked bank account into wallet
POST /wallet/cashout      → push wallet balance to linked bank account
```

## 3. Data Model

This reuses the Bank Ledger design's core tables almost unchanged — the interesting new piece is the social/contact layer and the linked external accounts:

```
wallets(user_id PK, balance bigint, currency, updated_at)
ledger_entries(id PK, txn_id FK, wallet_id FK, amount, direction, created_at)
transfers(id PK, txn_id UNIQUE, from_user, to_user, status, idempotency_key UNIQUE, created_at)
linked_accounts(id PK, user_id FK, bank_account_token, verified_at)
   -- tokenized via a partner (Plaid-style), never raw account/routing numbers stored
contacts(user_id FK, contact_user_id FK)  -- for the "who can I pay" social graph
```

## 4. High-Level Flow — Sending Money Between Two Wallets

Since both users already have wallet balances, an internal P2P transfer is *exactly* the Bank Ledger design's transfer sequence — debit sender's wallet, credit receiver's wallet, atomically, guarded by an idempotency key, with a check-and-update balance guard to prevent overdrafts. This should be said explicitly in the interview: "this is the same transfer primitive as a bank ledger transfer — I'm not redesigning it."

The genuinely new complexity is at the **edges** — moving money between the wallet and the outside banking world:

```
Top-up (bank → wallet):
  User initiates → ACH pull request to linked bank account →
  wallet credited immediately, optimistically, marked "pending settlement" →
  ACH actually settles 1-3 days later → reconcile; if ACH fails/reverses, debit wallet back + notify user

Cash-out (wallet → bank):
  User initiates → debit wallet immediately (money leaves the spendable balance right away) →
  ACH push initiated → funds arrive in user's bank 1-3 days later
```

The asymmetry is the interesting part to call out: crediting a top-up optimistically (before ACH settles) creates float risk — if the ACH pull fails days later, the user may have already spent money that was never really there. This needs either (a) a hold on newly top-up'd funds until settlement, or (b) a risk model that decides which users/amounts are safe to make spendable immediately based on account history — this is a direct tradeoff between user experience (instant funds) and fraud/credit risk, worth naming explicitly.

## 5. Failure Modes

| Failure | Detection | Recovery |
|---|---|---|
| ACH pull fails after optimistic credit | Bank webhook / batch reconciliation file | Debit wallet, notify user, possibly negative balance recovery flow |
| Duplicate transfer request | idempotency_key collision | Return cached result, no double-send |
| Sender and receiver on different wallet shards | Cross-shard debit/credit | Saga pattern, same as Bank Ledger's cross-shard answer |
| Receiver account doesn't exist / typo'd handle | Validation before debit | Reject before touching sender's balance, never a "send into the void" |
| Linked bank account revoked mid-cashout | Bank API error on push | Retry with backoff; fail back to wallet balance, notify user |

## 6. Tradeoffs to State Explicitly

- **Optimistic vs pessimistic top-up crediting** — instant-feeling UX vs float/fraud risk (the biggest design decision in this whole system)
- **Held wallet balance vs direct bank-to-bank** — a wallet model (Venmo-style) enables instant P2P since both sides are internal ledger entries, but requires users to trust holding a balance with you; direct bank-to-bank (Zelle-style) avoids that trust ask but is bound by ACH/RTP rail settlement speed for every single transfer, not just the edges
- **Social graph exposure** — P2P apps often make transfers visible to a feed/contacts by default; this is a product/privacy tradeoff worth flagging even though it's not a backend scaling concern

## Likely Follow-Ups to Prepare For

- *"What happens if two people send each other money at the exact same time?"* → Each transfer is its own atomic debit+credit pair with its own idempotency key; there's no shared mutable state between the two transfers other than each wallet's balance, and each wallet's balance update is itself an atomic check-and-update — so concurrent transfers in opposite directions don't need special-casing beyond what the base transfer primitive already guarantees.
- *"How would you detect a user cycling money to game a promotion (e.g. sign-up bonus)?"* → This is a fraud-detection-style velocity check: flag accounts with abnormal transfer patterns (many small transfers to new accounts, circular transfer graphs) using the same online/offline feature-store pattern as the fraud-detection design.
