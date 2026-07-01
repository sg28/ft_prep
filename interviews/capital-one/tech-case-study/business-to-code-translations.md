# Tech Case Study Answer — Business → Code Translations

The case study round sometimes gives a plain-English business rule instead of buggy code, and asks you to translate it directly. Same rules apply: integer cents, no float math on money, state assumptions out loud.

## "Customers with more than 6 months tenure pay 10% less"

```javascript
function applyTenureDiscount(priceCents, customer) {
    if (customer.tenureMonths <= 6) return priceCents;
    return Math.round(priceCents * 0.90);
}
```
Tenure check gates a flat multiplier on integer cents. Worth asking: is "more than 6 months" inclusive of exactly 6, or strictly greater? The rule as stated ("more than") means 6 itself does *not* qualify — `<= 6` returning early is deliberately literal to that wording.

## "Daily compounding APR"

```javascript
function compoundDaily(balanceCents, apr, days) {
    let balance = balanceCents;
    for (let i = 0; i < days; i++) {
        balance = Math.round(balance * (1 + apr / 365));
    }
    return balance;
}
```
Rounding happens *every day*, not once at the end — this matters because compounding on a rounded intermediate value each day is what actually happens in a real ledger (each day's interest is its own postable ledger entry), and it avoids the balance ever being a fractional cent internally. Never store or carry a float balance between days.

## "Skip fee if autopay enrolled"

```javascript
function calculateFee(baseFeeCents, account) {
    if (account.autopayEnrolled) return 0;
    return baseFeeCents;
}
```
Simple flag check — the only thing worth flagging out loud is *precedence*: if this fee-skip needs to interact with other fee logic (e.g. late fees, tier discounts), state explicitly which check runs first and why, since "skip fee" and "reduce fee" rules can silently conflict if layered in the wrong order.

## "Apply the higher of tier discount or promo discount, not both"

```javascript
function applyBestDiscount(priceCents, tierDiscount, promoDiscount) {
    const discount = Math.max(tierDiscount, promoDiscount);
    return Math.round(priceCents * (1 - discount));
}
```
The bug this rule is guarding against: naively summing `tierDiscount + promoDiscount` instead of taking `Math.max`. "Not both" is the whole rule — say it back to the interviewer to confirm you're not missing a case where they're meant to stack under certain conditions.

## "Cashback capped at $500/month"

```javascript
function applyCashback(purchaseCents, cashbackRate, monthlyTotalCents) {
    const MONTHLY_CAP_CENTS = 50_000; // $500.00
    const uncapped = Math.round(purchaseCents * cashbackRate);
    const remainingCap = Math.max(0, MONTHLY_CAP_CENTS - monthlyTotalCents);
    return Math.min(uncapped, remainingCap);
}
```
The cap must be tracked as a *running total per month*, not evaluated per-transaction in isolation — a single large purchase near the cap should be partially credited (whatever room remains under the cap), not fully denied or fully granted. `remainingCap` is what makes this a running-total-aware calculation rather than a flat per-transaction check.
