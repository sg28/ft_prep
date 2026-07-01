# Domain Refresher Answer — Finance Concepts

Format per concept (as the plan specifies): explainable in 2 sentences, as if to a non-engineer.

## PCI-DSS (Payment Card Industry Data Security Standard)

A set of security requirements that any organization handling credit card data must follow — covering things like never storing full card numbers or CVV codes in plaintext, encrypting card data in transit and at rest, and segmenting the network that touches card data from the rest of the systems. Non-compliance isn't just a fine risk — it can mean losing the ability to process card payments at all, so it shapes system design decisions (like tokenization) well before it becomes a compliance checkbox.

## ACH / Wire Transfer Flows

ACH (Automated Clearing House) transfers move money between US bank accounts in batches, settling in 1-3 business days and costing very little — this is what most direct deposits and bill payments use. Wire transfers move money individually and in near-real-time (often same-day), cost more, and are much harder to reverse once sent — which is exactly why wires are the preferred rail for fraudsters and the ones banks apply the most scrutiny to.

## Double-Entry Bookkeeping

Every financial transaction is recorded as two matching entries — a debit in one account and a credit in another — so the two always sum to zero and the books stay balanced by construction. This isn't just accounting tradition — in a ledger system (see [../system-design/bank-ledger-wallet.md](../system-design/bank-ledger-wallet.md)), it's what makes the ledger self-auditing: any discrepancy between debits and credits system-wide is immediately visible as a bug, not something you'd only catch during a manual audit.

## Common Fraud Patterns

**Card testing** — a fraudster runs many small charges (often $1 or less) against stolen card numbers to find which ones are still active, before attempting a larger charge; this shows up as a burst of tiny declined-or-approved transactions across many merchants in a short window. **Account takeover** — a fraudster gains access to a legitimate account (via phishing, credential stuffing, or a data breach) and then behaves like the real user, which is why it's much harder to catch with simple rules than card testing — the fraud signal is a *behavior change* (new device, new location, unusual transaction pattern) rather than an obviously fake transaction. **Synthetic identity fraud** — a fraudster builds a fake identity from a mix of real and fabricated personal data (e.g. a real SSN paired with a fake name) to open new accounts, and it's the hardest of these to catch upfront because there's no real victim to file a complaint and trigger detection. **Velocity abuse** — an unusually high rate of transactions or account actions in a short window (many transactions from one card in one minute, many accounts created from one IP), which is exactly what the fraud-detection design's sliding-window features (`txn_count_1m`, `txn_count_5m`, `txn_count_1h`) are built to catch — see [../system-design/fraud-detection.md](../system-design/fraud-detection.md).
