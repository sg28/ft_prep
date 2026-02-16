# Universal Binary Search Pattern

## The Pattern

```javascript
let lo = 0, hi = nums.length;

while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);

  if (CONDITION) {
    hi = mid;
  } else {
    lo = mid + 1;
  }
}

return lo;
```

Change **CONDITION** based on what you're looking for.

## Examples

### Find Target

```javascript
function findTarget(nums, target) {
  let lo = 0, hi = nums.length;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] >= target) hi = mid;
    else lo = mid + 1;
  }

  if (lo < nums.length && nums[lo] === target) return lo;
  return -1;
}
```

### Find First Occurrence

```javascript
function findFirst(nums, target) {
  let lo = 0, hi = nums.length;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] >= target) hi = mid;
    else lo = mid + 1;
  }

  if (lo < nums.length && nums[lo] === target) return lo;
  return -1;
}
```

Same as find target.

### Find Last Occurrence

```javascript
function findLast(nums, target) {
  let lo = 0, hi = nums.length;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > target) hi = mid;
    else lo = mid + 1;
  }

  lo = lo - 1;
  if (lo >= 0 && nums[lo] === target) return lo;
  return -1;
}
```

Changed `>=` to `>`, subtract 1.

### Insert Position

```javascript
function searchInsert(nums, target) {
  let lo = 0, hi = nums.length;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] >= target) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}
```

### Perfect Square

```javascript
// When while (lo < hi) ends, lo === hi, so checking either one works. We use lo by convention.
function isPerfectSquare(num) {
  let lo = 1, hi = num + 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (mid * mid >= num) hi = mid;
    else lo = mid + 1;
  }

  if (lo * lo === num) return true;
  return false;
}
```

### Koko Eating Bananas

```javascript
function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles) + 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    let hours = 0;
    for (const pile of piles) {
      hours += Math.ceil(pile / mid);
    }

    if (hours <= h) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}
```

### Ship Packages

```javascript
function shipWithinDays(weights, days) {
  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b) + 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    let daysNeeded = 1, currentLoad = 0;
    for (const weight of weights) {
      if (currentLoad + weight > mid) {
        daysNeeded++;
        currentLoad = weight;
      } else {
        currentLoad += weight;
      }
    }

    if (daysNeeded <= days) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}
```

### Search 2D Matrix

```javascript
function searchMatrix(matrix, target) {
  const m = matrix.length;
  const n = matrix[0].length;
  let lo = 0, hi = m * n;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const row = Math.floor(mid / n);
    const col = mid % n;
    const value = matrix[row][col];

    if (value >= target) hi = mid;
    else lo = mid + 1;
  }

  const row = Math.floor(lo / n);
  const col = lo % n;
  if (lo < m * n && matrix[row][col] === target) return true;
  return false;
}
```

Treat 2D matrix as 1D array. Convert index with `row = mid / n`, `col = mid % n`.

## Common Patterns

| Problem | Condition |
|---|---|
| Find first >= target | `nums[mid] >= target` |
| Find last <= target | `nums[mid] > target` (subtract 1) |
| Minimize speed/capacity | `canFinish(mid)` |

## Template

```javascript
let lo = START, hi = END;

while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (CONDITION) hi = mid;
  else lo = mid + 1;
}

return lo;
```

That's it.
