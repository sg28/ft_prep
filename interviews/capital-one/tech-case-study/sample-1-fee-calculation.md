# Tech Case Study Answer — Sample 1: Fee Calculation

## The Code

```javascript
function calculateLateFee(balance, daysLate, customerType) {
    let fee = 0;
    if (daysLate > 0) {
        if (customerType === 'premium') {
            fee = balance * 0.01;
        } else if (customerType === 'regular') {
            fee = balance * 0.02;
        } else {
            fee = balance * 0.02;
        }
        if (daysLate > 30) {
            fee = fee * 2;
        } else if (daysLate > 60) {
            fee = fee * 3;
        }
    }
    return fee;
}
```

## Purpose (one sentence)

Calculate a late fee based on account balance, days overdue, and customer tier.

## Bugs

1. **The `daysLate > 60` branch is unreachable.** `daysLate > 30` is checked first and is `true` for anything over 30, including anything over 60 — so the `else if (daysLate > 60)` never fires. The order needs to be reversed, checking the larger threshold first.
2. **`regular` and the default (`else`) both yield the same 2% rate** — this is a duplicated branch. Either it's intentional (in which case the `else if` should be removed and folded into the default), or a distinct tier was meant to be handled there and is silently missing.
3. **Float math on currency.** `balance * 0.01` on a JS `number` accumulates rounding error over many calculations — money math needs integer cents, not floats.
4. **No cap on the fee.** With the multiplier bug fixed, a very overdue premium customer could still be charged an unbounded fee — there's no maximum.
5. **No validation.** Negative balance or negative `daysLate` isn't checked; the function will happily compute nonsense for bad input instead of returning early.

## Refactor

```javascript
const LATE_FEE_RATES = { premium: 0.01, regular: 0.02 };
const DEFAULT_RATE = 0.02;

function calculateLateFee(balanceCents, daysLate, customerType) {
    if (balanceCents <= 0 || daysLate <= 0) return 0;
    const rate = LATE_FEE_RATES[customerType] ?? DEFAULT_RATE;
    const multiplier = daysLate > 60 ? 3 : daysLate > 30 ? 2 : 1;
    return Math.round(balanceCents * rate * multiplier);
}
```

The multiplier logic is now a single ternary chain checked largest-threshold-first, so there's no unreachable branch. Rates live in a lookup table instead of an if/else chain, which also makes the "regular = default" duplication visible and removable at a glance.

## Note on Float Math in JS

JS has no native `Decimal` type. For interview-grade code, integer cents + `Math.round` is an acceptable simplification — say this out loud so the interviewer knows it's a deliberate choice, not an oversight. In production, reach for `decimal.js` or `bignumber.js` instead.

## Complexity

O(1) time and space — no loops, no data structures, fixed amount of work regardless of input size.
