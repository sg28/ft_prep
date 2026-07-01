# Tech Case Study Answer — Sample 5: Top Spenders

## The Code

```javascript
function getTopSpenders(transactions, n) {
    const totals = {};
    for (const t of transactions) {
        if (t.user in totals) {
            totals[t.user] += t.amount;
        } else {
            totals[t.user] = t.amount;
        }
    }
    const sortedUsers = Object.entries(totals).sort((a, b) => a[1] - b[1]);
    return sortedUsers.slice(0, n);
}
```

## Purpose (one sentence)

Return the top N users by total transaction amount.

## Bugs

1. **The sort comparator is ascending, not descending** — `a[1] - b[1]` sorts smallest-to-largest, so `.slice(0, n)` returns the **lowest** spenders, the opposite of what the function name promises. This is the headline bug — everything else is secondary until this is fixed.
2. **No tie-break on equal totals.** Two users with identical totals sort in whatever order the engine happens to produce, which is non-deterministic-feeling even if technically stable — a real system needs a defined tie-break (e.g. alphabetical by user ID) for reproducible results.
3. **No handling of `n <= 0` or `n` larger than the number of unique users** — not a crash, but worth explicitly deciding: does `n=0` return `[]`? Does `n=1000` on 10 users just return those 10? (`slice` already handles the latter gracefully, but it should be a stated decision, not an accident.)
4. **Counts every transaction, including refunds and declined transactions.** "Top spenders" almost certainly means net *settled* spend, not gross transaction volume — refunds should probably subtract, and declined transactions shouldn't count at all.
5. **`in` operator on a plain object checks inherited properties too**, not just the object's own keys — using `Object.hasOwn(totals, t.user)` (or switching to a `Map`, which has no prototype chain to worry about) avoids a class of subtle bugs if `totals` ever picks up a key that collides with something on `Object.prototype`.

## Refactor

```javascript
function getTopSpenders(transactions, n) {
    if (n <= 0) return [];
    const totals = new Map();
    for (const t of transactions) {
        if (t.status !== 'settled' || t.amount <= 0) continue;
        totals.set(t.user, (totals.get(t.user) ?? 0) + t.amount);
    }
    return [...totals.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, n);
}
```

Fixes, in order: descending sort (`b[1] - a[1]`), a tie-break (`a[0].localeCompare(b[0])`), an early return for `n <= 0`, filtering to settled positive-amount transactions only, and swapping the plain object for a `Map` to sidestep the `in`-operator issue entirely.

## Complexity

O(m + k log k), where `m` = number of transactions (one pass to build totals) and `k` = number of unique users (sorting the aggregated map).
