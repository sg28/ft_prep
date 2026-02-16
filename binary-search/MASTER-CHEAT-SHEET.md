# Binary Search Master Cheat Sheet

## The 3 Core Templates

### Template A: Exact Match
**When:** Find specific target in sorted array
**Pattern:** `lo <= hi` (inclusive boundaries)
**Returns:** Index of target or -1

```javascript
function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;  // INCLUSIVE hi

  while (lo <= hi) {  // <= because we check every element
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;  // Must use +1
    else hi = mid - 1;                     // Must use -1
  }
  return -1;  // lo > hi means not found
}
```

**Why `lo <= hi`?** We need to check the last remaining element.
**Why `mid ± 1`?** To avoid infinite loops when lo === hi.

---

### Template B: Boundary Search (Lower/Upper Bound)
**When:** Find first/last occurrence, insertion point
**Pattern:** `lo < hi` (exclusive hi)
**Returns:** Insertion point (always valid index)

```javascript
// Lower Bound: First index where nums[i] >= target
function lowerBound(nums, target) {
  let lo = 0, hi = nums.length;  // EXCLUSIVE hi

  while (lo < hi) {  // < because we converge to answer
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] >= target) hi = mid;  // No -1! mid could be answer
    else lo = mid + 1;
  }
  return lo;  // lo === hi (converged)
}

// Upper Bound: First index where nums[i] > target
function upperBound(nums, target) {
  let lo = 0, hi = nums.length;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] > target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

**Why `lo < hi`?** We're finding a boundary, not an exact match.
**Why `hi = mid` (no -1)?** Mid could BE the answer (first ≥ target).
**Why exclusive hi?** Works even when target doesn't exist.

---

### Template C: Binary Search on Answer Space
**When:** Find minimum/maximum value that satisfies condition
**Pattern:** `lo < hi` (search range of possible answers)
**Returns:** Optimal answer

```javascript
function binarySearchOnAnswer(lo, hi, isValid) {
  // isValid(x): returns true if x satisfies the condition

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (isValid(mid)) hi = mid;      // mid works, try smaller
    else lo = mid + 1;               // mid fails, need bigger
  }
  return lo;  // Minimum value that works
}
```

**Why this works?** Answer space has property: `false...false true...true`
**When to use?** "Find minimum speed/capacity/time such that..."

---

## Quick Decision Tree

```
┌─ Searching in sorted array?
│  ├─ YES → Template A (exact match)
│  └─ NO ↓
│
├─ Finding first/last occurrence or insertion point?
│  ├─ YES → Template B (boundary search)
│  └─ NO ↓
│
└─ Optimizing a value (min/max speed, capacity, etc.)?
   └─ YES → Template C (answer space)
```

---

## Common Patterns & When to Use Each

| Problem Type | Template | Key Indicator |
|-------------|----------|---------------|
| Classic binary search | A | "Find target in sorted array" |
| First/last occurrence | B | "Find first index where..." |
| Insertion point | B | "Where to insert to keep sorted?" |
| Rotated sorted array | A* | Uses A skeleton with extra logic |
| Find min in rotated array | B | Converges to rotation point |
| Search 2D matrix | A | Treat as flattened 1D array |
| Koko eating bananas | C | "Minimum speed such that..." |
| Capacity to ship packages | C | "Minimum capacity such that..." |
| First bad version | C | "Find first index where condition true" |
| Median of two arrays | A* | Uses partition logic |

*Modified template

---

## Critical Differences: Template A vs B

| Aspect | Template A | Template B |
|--------|-----------|-----------|
| **Loop condition** | `lo <= hi` | `lo < hi` |
| **hi initialization** | `nums.length - 1` | `nums.length` |
| **When to use** | Exact match | Boundary/insertion |
| **Update mid** | `lo = mid + 1` or `hi = mid - 1` | `lo = mid + 1` or `hi = mid` |
| **Termination** | `lo > hi` (not found) | `lo === hi` (converged) |
| **Return value** | Index or -1 | Always valid index |

---

## Edge Cases Checklist

Always test these before submitting:

- [ ] Empty array: `[]`
- [ ] Single element: `[x]`
- [ ] Two elements: `[x, y]`
- [ ] Target not in array
- [ ] Target at start: `nums[0]`
- [ ] Target at end: `nums[nums.length - 1]`
- [ ] All elements same: `[5,5,5,5,5]`
- [ ] Target smaller than all elements
- [ ] Target larger than all elements

---

## Common Bugs & How to Avoid

### Bug #1: Infinite Loop
**Cause:** Using `hi = mid` with `lo <= hi`
**Fix:** Use Template B pattern (`lo < hi` + `hi = mid`)

### Bug #2: Off-by-One Error
**Cause:** Mixing inclusive/exclusive boundaries
**Fix:** Stick to template! A uses inclusive, B uses exclusive

### Bug #3: Integer Overflow
**Cause:** `mid = (lo + hi) / 2` when lo+hi > MAX_INT
**Fix:** Use `mid = lo + Math.floor((hi - lo) / 2)` (or just stick with `Math.floor((lo + hi) / 2)` in JavaScript)

### Bug #4: Wrong Template Choice
**Cause:** Using Template A for boundary problems
**Fix:** Use decision tree above

---

## Time Complexity Quick Reference

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| Classic BS | O(log n) | O(1) | Halve search space each iteration |
| Lower/Upper Bound | O(log n) | O(1) | Same as classic |
| Rotated Array Search | O(log n) | O(1)* | *O(n) worst with duplicates |
| 2D Matrix | O(log(m×n)) | O(1) | Treat as 1D array |
| Answer Space | O(n log k) | O(1) | n = validation cost, k = range |

---

## Interview Script Template

When you see a binary search problem in an interview:

**Step 1: Identify Pattern (30 sec)**
> "This is a [exact match / boundary / answer space] problem, so I'll use Template [A/B/C]."

**Step 2: Define Search Space (30 sec)**
> "The search space is [lo to hi], where lo = [value] and hi = [value]."

**Step 3: Explain Invariant (1 min)**
> "I'm maintaining the invariant that [what's true about elements in lo..mid vs mid+1..hi]."

**Step 4: Code (5-10 min)**
> Write template code, fill in comparison logic.

**Step 5: Test (2 min)**
> "Let me trace through with [edge case]..."

**Total:** < 15 minutes for medium problems.

---

## Mastery Milestones

- ✅ **Week 1:** Can identify template needed in < 30 seconds
- ✅ **Week 2:** Solve medium problems without bugs
- ✅ **Week 3:** Solve hard problems in < 25 minutes
- ✅ **Week 4:** Explain your solution clearly in interviews

---

**Keep this sheet open while solving problems.**
**Don't memorize — understand WHY each template works!**
