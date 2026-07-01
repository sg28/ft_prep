# Tech Case Study Answer — Sample 3: Balance Update

## The Code

```javascript
function updateBalance(account, amount) {
    account.balance = account.balance + amount;
    if (account.balance < 0) {
        account.balance = 0;
    }
    return account;
}
```

## Purpose (one sentence)

Add an amount to an account's balance, clamping the result at zero.

## Bugs

1. **Silently swallows overdrafts.** If applying `amount` would take the balance negative, it's clamped to zero with no signal to the caller — the caller can't tell whether the full amount was applied, partially applied, or rejected. In a banking context, silently losing part of a requested debit is a serious correctness bug, not a UX nitpick.
2. **No idempotency.** If this function is called twice for the same logical transaction (e.g. a network retry), the amount is applied twice — there's no `txnId` tracking to detect and reject a replay.
3. **Mutates the input object directly.** In concurrent code (multiple requests touching the same account), in-place mutation without any locking or atomic guard is a race condition waiting to happen — two concurrent calls could both read the same starting balance and stomp on each other's write.
4. **No type or sign checks.** Nothing validates that `amount` is actually a number, or handles `NaN`/`Infinity` inputs.
5. **Returns the whole `account` object**, leaking whatever else is on that object beyond what the caller needs — a wider interface than necessary, and a bigger surface for accidental misuse.

## Refactor

```javascript
function applyBalanceChange(account, amountCents, txnId, seenTxns) {
    // Returns { success: boolean, balance: number }. Idempotent on txnId.
    if (seenTxns.has(txnId)) {
        return { success: true, balance: account.balance };
    }
    const newBalance = account.balance + amountCents;
    if (newBalance < 0) {
        return { success: false, balance: account.balance };
    }
    account.balance = newBalance;
    seenTxns.add(txnId);
    return { success: true, balance: newBalance };
}
```

Key changes: takes a `txnId` and a `seenTxns` set for idempotency; returns a `{ success, balance }` result instead of silently clamping, so the caller always knows what actually happened; rejects (rather than clamps) an overdraft, since "partially apply a withdrawal" is rarely the correct business behavior — the caller can decide what to do with a `success: false` response.

## Complexity

O(1) time, O(1) space — excluding the unbounded growth of `seenTxns` over the life of the program, which in a real system would need a TTL or external store rather than an in-memory `Set` that grows forever.
