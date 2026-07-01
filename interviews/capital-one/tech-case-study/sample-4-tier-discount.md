# Tech Case Study Answer — Sample 4: Tier Discount

## The Code

```javascript
function applyDiscount(price, customer) {
    let discount = 0;
    if (customer.tier === 'gold') {
        discount = 0.15;
    }
    if (customer.tier === 'silver') {
        discount = 0.10;
    }
    if (customer.tenureMonths > 12) {
        discount = discount + 0.05;
    }
    return price - (price * discount);
}
```

## Purpose (one sentence)

Apply a tier-based discount to a price, with a bonus for long-tenure customers.

## Bugs

1. **Three separate `if` statements instead of `if`/`else if`.** This only produces the correct result because the tiers happen to be mutually exclusive today — but it's fragile: if a new tier is ever added without updating this function to an `else if` chain, two conditions could both evaluate true and silently produce a wrong (summed or overwritten) discount.
2. **No cap on the stacked discount.** `discount + 0.05` for tenure has no upper bound — if a future tier is added with a higher base rate, the stacked total could exceed 100%, which would make `price - (price * discount)` negative.
3. **Float math on price** — same category of bug as Sample 1; money math should be integer cents.
4. **No null/undefined check on `customer`.** If `customer` is `null` or missing `tier`/`tenureMonths`, this throws instead of failing gracefully.
5. **A no-tier customer with >12 months tenure still gets 5% off a 0% base discount** — this is a business-logic question, not obviously a "bug," but worth flagging: should the tenure bonus only apply on top of an *existing* discount, or should every long-tenure customer get something? The current code answers "yes, everyone gets the bonus" implicitly, and that should be confirmed rather than assumed.

## Refactor

```javascript
const TIER_DISCOUNTS = { gold: 0.15, silver: 0.10, bronze: 0.05 };
const TENURE_BONUS = 0.05;
const MAX_DISCOUNT = 0.50;

function applyDiscount(priceCents, customer) {
    if (customer == null || priceCents <= 0) return priceCents;
    const base = TIER_DISCOUNTS[customer.tier] ?? 0;
    const bonus = customer.tenureMonths > 12 && base > 0 ? TENURE_BONUS : 0;
    const total = Math.min(base + bonus, MAX_DISCOUNT);
    return Math.round(priceCents * (1 - total));
}
```

This refactor makes an explicit product decision on bug #5 — the tenure bonus only applies when `base > 0`, i.e. only tenured customers who already have a tier discount get the bonus. That's a judgment call that should be stated and confirmed with the interviewer, not silently baked in.

## Complexity

O(1) — a fixed handful of lookups and arithmetic operations regardless of input.
