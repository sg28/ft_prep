# Sliding Window — Pattern Reference (JavaScript)

Almost every sliding window problem maps to one of two templates.

---

## Pattern 1 — Fixed Window (size = k)

Use when: the window size is given upfront.

```javascript
function fixedWindow(arr, k) {
    let left = 0;
    let result = 0;
    let windowVal = 0;

    for (let right = 0; right < arr.length; right++) {
        windowVal += arr[right];

        if (right >= k - 1) {
            result = Math.max(result, windowVal);
            windowVal -= arr[left];
            left++;
        }
    }
    return result;
}
```

---

## Pattern 2 — Variable Window (expand / shrink)

Use when: find the **longest** or **shortest** subarray/substring satisfying a condition.

```javascript
function variableWindow(arr) {
    let left = 0;
    let result = 0;
    let windowVal = 0;

    for (let right = 0; right < arr.length; right++) {
        // 1. Expand: absorb arr[right] into window
        windowVal += arr[right];

        // 2. Shrink: while window is invalid, move left forward
        while (/* window is invalid */) {
            windowVal -= arr[left];
            left++;
        }

        // 3. Window is now valid — record answer
        result = Math.max(result, right - left + 1);
    }
    return result;
}
```

The only thing that changes between problems:
- what `windowVal` tracks (a `Map`, a count, a sum, a `Set`)
- what "invalid" means in the `while` / `if` condition

---

## The 5 Core Variants

| Variant | windowState | Invalid condition |
|---|---|---|
| Max sum of k elements | running sum | `i >= k` (fixed) |
| Longest no-repeat substring | `Map` char → count | any char count > 1 |
| Longest with at most K distinct | `Map` char → count | `map.size > k` |
| Min window containing all chars | `Map` + `have/need` counters | `have < need` |
| Max consecutive 1s with K flips | count of zeros | `zeros > k` |

---

## Capital One OA Problems

### 1. Duplicate Transactions in N Seconds

```javascript
// Given a list of transactions [{id, timestamp}], return true if any
// two transactions with the same id occur within N seconds of each other.
function hasDuplicateTransaction(transactions, n) {
    const window = new Map(); // id -> last seen timestamp
    transactions.sort((a, b) => a.timestamp - b.timestamp);

    let left = 0;
    for (let right = 0; right < transactions.length; right++) {
        const { id, timestamp } = transactions[right];

        // Shrink: drop transactions outside the N-second window
        while (timestamp - transactions[left].timestamp > n) {
            const leftId = transactions[left].id;
            window.delete(leftId);
            left++;
        }

        if (window.has(id)) return true;
        window.set(id, timestamp);
    }
    return false;
}
```

### 2. Longest Substring Without Repeating Characters

```javascript
// Given a string, return the length of the longest substring
// with no repeating characters.
function lengthOfLongestSubstring(s) {
    const seen = new Map(); // char -> count
    let left = 0;
    let result = 0;

    for (let right = 0; right < s.length; right++) {
        const c = s[right];
        seen.set(c, (seen.get(c) ?? 0) + 1);

        // Shrink: while duplicate exists, move left
        while (seen.get(c) > 1) {
            const lc = s[left];
            seen.set(lc, seen.get(lc) - 1);
            if (seen.get(lc) === 0) seen.delete(lc);
            left++;
        }

        result = Math.max(result, right - left + 1);
    }
    return result;
}
```

---

## Mental Checklist for Any New Problem

1. Fixed k or find optimal length? → pick template
2. What makes a window valid / invalid?
3. What do I track in `windowState`? (usually a `Map` or a counter)
4. Am I maximizing or minimizing? → `Math.max` vs `Math.min`
