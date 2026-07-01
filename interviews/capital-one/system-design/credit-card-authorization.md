# System Design Answer — Credit Card Authorization

**Note:** Doc marks this "fold into Ledger discussion if time-short" — treat as an extension of the Bank Ledger design (see [bank-ledger-wallet.md](bank-ledger-wallet.md)) rather than a from-scratch design. The ledger's "hold, then post" concept is the connective tissue between the two.

## Components

- **Application service** — KYC + credit decisioning + credit bureau pull (happens once, at card issuance, not per-transaction)
- **Card management** — issue, freeze, replace, tokenization (so the card number itself is never stored/transmitted in the clear)
- **Authorization service** — real-time, <100ms budget, calls fraud scoring + limit check per transaction
- **Statement service** — batch nightly + on-demand generation
- **Payment service** — integration with a banking partner or Plaid-style provider for actually moving money
- **Notification service** — customer-facing alerts (declines, large transactions, etc.)

## Auth Flow

```
Merchant POS → Network → C1 Auth Service
  → Fraud score
  → Limit check (available_credit ≥ amount?)
  → Velocity check
  → Approve/decline → ledger hold (not posted) → response
Posting flow (later, batch): hold → posted entry in ledger
```

## Why "Hold, Then Post" Instead of Posting Immediately

This is the detail worth calling out unprompted, since it's exactly the ledger design's `transactions`/`ledger_entries` split applied to card auth:

- **At authorization time** (sub-100ms budget), the system places a *hold* against the account's available credit — reducing what's available for further spend, without yet writing a permanent, immutable ledger entry. Holds are cheap to create and release, which matters because a meaningful fraction of authorizations never actually settle (pre-auth holds at gas pumps/hotels, declined-after-approval edge cases, merchant never captures the charge).
- **At settlement** (typically hours to days later, in batch), the merchant "captures" the hold, and *that's* when a permanent, append-only ledger entry gets posted — following the same double-entry pattern as the Bank Ledger design.

This mirrors why the Bank Ledger design keeps a `transactions` table (mutable status: pending/committed) separate from `ledger_entries` (immutable, append-only) — auth holds are the "pending" state, and posted entries are the "committed" state.

## Failure Modes Worth Mentioning

- **Fraud service down mid-authorization** → fail open with rules-only scoring rather than declining every transaction (same principle as the fraud-detection design's failure table)
- **Limit check race** — two simultaneous authorizations against the same account could both pass a naive read-then-check limit check; needs the same atomic `UPDATE ... WHERE available_credit >= amount` pattern as the ledger's debit guard, not a separate read-then-write
- **Hold never captured** — a hold that's placed but never settled (merchant abandons the charge) needs a TTL-based expiry job to release it back to available credit, otherwise available credit silently shrinks over time
