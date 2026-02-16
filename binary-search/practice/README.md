# Binary Search Practice

Master binary search through deliberate practice.

## How to Use This

1. Start with `easy.js` - solve all 5 problems
2. Move to `medium.js` - solve all 5 problems
3. Challenge yourself with `hard.js` - solve all 3 problems
4. Check `solutions.js` only AFTER you attempt each problem

## The Universal Pattern

```javascript
let lo = START, hi = END;

while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (CONDITION) hi = mid;
  else lo = mid + 1;
}

return lo;
```

## Progress Tracker

**Easy (5/5):**
- [ ] Binary Search
- [ ] Search Insert Position
- [ ] First Bad Version
- [ ] Valid Perfect Square
- [ ] Find Smallest Letter

**Medium (5/5):**
- [ ] Find First and Last Position
- [ ] Search in Rotated Array
- [ ] Koko Eating Bananas
- [ ] Ship Packages in D Days
- [ ] Search 2D Matrix

**Hard (3/3):**
- [ ] Split Array Largest Sum
- [ ] Minimize Max Distance to Gas Station
- [ ] Median of Two Sorted Arrays

## Expected Timeline

- Easy: 30-45 minutes
- Medium: 45-60 minutes
- Hard: 30-45 minutes

**Total: 2-3 hours to master binary search**
