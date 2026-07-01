# Tech Case Study Answer — Sample 2: Transaction Dedup

## The Code

```javascript
function removeDuplicates(transactions) {
    const seen = [];
    for (const t of transactions) {
        if (!seen.includes(t)) {
            seen.push(t);
        }
    }
    return seen;
}
```

## Purpose (one sentence)

Remove duplicate transactions from an array.

## Bugs

1. **`seen.includes(t)` is O(n) per call, inside an O(n) loop → O(n²) overall.** For a large transaction list this is a real performance problem, not just a style nit.
2. **Comparing by reference, not by transaction identity.** `Array.prototype.includes` uses `===`, so two different transaction objects with identical `txnId`/content are *not* considered duplicates — they're different object references. This means the function doesn't actually catch the duplicates it's meant to catch, which is worse than the performance issue.
3. **"Duplicate" is never defined.** Exact object match? Same `txnId`? Same amount+timestamp+account? Whoever wrote this needs to state the definition before it can be correctly implemented — this is exactly the kind of clarifying question to ask out loud before touching the code.
4. **Order preservation happens to work but isn't documented.** The function preserves first-seen order, which may or may not be a requirement — worth calling out as an implicit behavior that a future refactor could accidentally break.

## Refactor

```javascript
function removeDuplicateTransactions(transactions) {
    const seenIds = new Set();
    const result = [];
    for (const t of transactions) {
        if (!seenIds.has(t.txnId)) {
            seenIds.add(t.txnId);
            result.push(t);
        }
    }
    return result;
}
```

Switching from `Array.includes` to `Set.has` fixes both the performance bug (O(1) lookup instead of O(n)) and the identity bug (dedup by `txnId` field, not object reference) in one change.

## Complexity

O(n) time, O(n) space — one pass through the input, one `Set` sized to the number of unique transactions.
