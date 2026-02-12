/*
  ═══════════════════════════════════════════════════════════════
                 BINARY SEARCH PRACTICE JOURNEY
              Solve It Yourself - Guided Hints Only
  ═══════════════════════════════════════════════════════════════
*/

// ═══════════════════════════════════════════════════════════════
// LEVEL 1: BASICS — Exact Match & Boundaries
// ═══════════════════════════════════════════════════════════════

/*
  1. CLASSIC BINARY SEARCH (LeetCode 704)
  ─────────────────────────────────────────
  
  PROBLEM: Find the exact index of target in a sorted array.
  Return -1 if not found.
  
  Example: [1, 3, 5, 7, 9] target=5 → 2
           [1, 3, 5, 7, 9] target=4 → -1
  
  HINTS:
  • Use two pointers: lo (left), hi (right)
  • Set hi = nums.length - 1 (inclusive boundary)
  • Calculate mid = Math.floor((lo + hi) / 2)
  • Three cases in loop:
    - nums[mid] === target? Return mid
    - nums[mid] < target? Move lo to mid + 1
    - nums[mid] > target? Move hi to mid - 1
  • Loop condition: lo <= hi (while search space has elements)
  • Return -1 if not found
  
  TIME: O(log n)  SPACE: O(1)
*/
function binarySearch(nums, target) {
  // YOUR CODE HERE
  let left = 0, right = nums.length - 1;
  while(left <= right){
    let mid = Math.floor((left + right) / 2);
    if(nums[mid] === target){
        return mid;
    }
    if(nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// Test cases for you to verify
console.log("=== TEST: CLASSIC BINARY SEARCH ===");
console.log(binarySearch([1, 3, 5, 7, 9], 5));           // Expected: 2
console.log(binarySearch([1, 3, 5, 7, 9], 1));           // Expected: 0
console.log(binarySearch([1, 3, 5, 7, 9], 9));           // Expected: 4
console.log(binarySearch([1, 3, 5, 7, 9], 4));           // Expected: -1
console.log(binarySearch([], 5));                        // Expected: -1


/*
  2. LOWER BOUND (LeetCode 34 - Start Position)
  ──────────────────────────────────────────────
  
  PROBLEM: Find FIRST index where nums[i] >= target.
  Think of it as: where would target be inserted to keep array sorted?
  
  Example: [5, 7, 7, 8, 8, 10] target=8 → 3 (first 8)
           [5, 7, 7, 8, 8, 10] target=6 → 3 (insertion point)
           [5, 7, 7, 8, 8, 10] target=11 → 6 (end of array)
  
  HINTS:
  • Different from binarySearch! This finds boundaries, not exact match
  • Set hi = nums.length (EXCLUSIVE - not -1!)
  • Loop condition: lo < hi (different pattern!)
  • When nums[mid] >= target: it COULD be the answer, so hi = mid (no -1)
  • When nums[mid] < target: move lo = mid + 1 (always +1, never mid)
  • Loop converges when lo === hi
  • Why exclusive hi? Because we're finding an insertion point
  
  TIME: O(log n)  SPACE: O(1)
  
  KEY INSIGHT: With lo < hi and exclusive hi, we ALWAYS converge to answer
*/
function lowerBound(nums, target) {
  let left = 0, right = nums.length;
  while(left < right){
    let mid = Math.floor((left + right) / 2);
    
    if(nums[mid] >= target){
        right = mid;
    }else{
        left = mid + 1;
    }
  }
 return left;
}

console.log("\n=== TEST: LOWER BOUND ===");
console.log(lowerBound([5, 7, 7, 8, 8, 10], 8));         // Expected: 3
console.log(lowerBound([5, 7, 7, 8, 8, 10], 6));         // Expected: 3
console.log(lowerBound([5, 7, 7, 8, 8, 10], 11));        // Expected: 6
console.log(lowerBound([5, 7, 7, 8, 8, 10], 5));         // Expected: 0


/*
  3. UPPER BOUND
  ──────────────
  
  PROBLEM: Find FIRST index where nums[i] > target.
  (Similar to lower bound but with > instead of >=)
  
  Example: [5, 7, 7, 8, 8, 10] target=8 → 5 (first element > 8)
           [5, 7, 7, 8, 8, 10] target=7 → 3 (first element > 7)
  
  HINTS:
  • Same structure as lowerBound
  • Only change the comparison: use > instead of >=
  • Everything else stays the same!
  
  TIME: O(log n)  SPACE: O(1)
*/
function upperBound(nums, target) {
  let left = 0;
  let right = nums.length;
  while(left < right){
    let mid = Math.floor((left + right) / 2);
    if(nums[mid] > target){
        right = mid;
    }else{
        left = mid + 1;
    }
  }
  return left;
}

console.log("\n=== TEST: UPPER BOUND ===");
console.log(upperBound([5, 7, 7, 8, 8, 10], 8));         // Expected: 5
console.log(upperBound([5, 7, 7, 8, 8, 10], 7));         // Expected: 3
console.log(upperBound([5, 7, 7, 8, 8, 10], 5));         // Expected: 1


/*
  4. FIND RANGE (LeetCode 34)
  ───────────────────────────
  
  PROBLEM: Find [first, last] index of target in sorted array.
  Return [-1, -1] if not found.
  
  Example: [5, 7, 7, 8, 8, 10] target=8 → [3, 4]
           [5, 7, 7, 8, 8, 10] target=6 → [-1, -1]
  
  HINTS:
  • Use lowerBound to find first occurrence
  • Check if target actually exists (compare nums[first] with target)
  • Use upperBound to find last occurrence (then subtract 1)
  • Why subtract 1? Because upperBound gives first element > target
  • Handle the "not found" case
  
  TIME: O(log n)  SPACE: O(1)
  
  KEY INSIGHT: lowerBound + upperBound can solve range problems!
*/

function searchRange(nums, target) {
  const lowerFn = function(nums, target){
    let left = 0;
    let right = nums.length;
    while(left < right){
        let mid = Math.floor((left + right) / 2);
        if(nums[mid] >= target){
            right = mid;
        }else{
            left = mid+1;
        }
    }
    return left;
  }
  const upperFn = (nums, target)=>{
    let left = 0;
    let right = nums.length;
    while(left < right){
        let mid = Math.floor((left + right) / 2);
        if(nums[mid] > target){
            right = mid;
        }else{
            left = mid+1;
        }
    }
    return left - 1;
  }
  const first = lowerFn(nums, target);
  if (first >= nums.length || nums[first] !== target) return [-1, -1];
  const last = upperFn(nums, target);
  return [first, last];
}

console.log("\n=== TEST: FIND RANGE ===");
console.log(searchRange([5, 7, 7, 8, 8, 10], 8));        // Expected: [3, 4]
console.log(searchRange([5, 7, 7, 8, 8, 10], 6));        // Expected: [-1, -1]
console.log(searchRange([5, 7, 7, 8, 8, 10], 7));        // Expected: [1, 2]
console.log(searchRange([1], 1));                        // Expected: [0, 0]


// ═══════════════════════════════════════════════════════════════
// LEVEL 2: INTERMEDIATE — Rotated & Modified Arrays
// ═══════════════════════════════════════════════════════════════

/*
  5. SEARCH IN ROTATED SORTED ARRAY (LeetCode 33)
  ───────────────────────────────────────────────
  
  PROBLEM: Find target in rotated sorted array (distinct elements).
  
  Example: [4, 5, 6, 7, 0, 1, 2] target=0 → 4
           [4, 5, 6, 7, 0, 1, 2] target=3 → -1
  
  IMPORTANT INSIGHT: At any point, ONE half is always normally sorted!
  
  HINTS:
  • Start with binary search template (lo <= hi)
  • Check if target equals nums[mid] → return mid
  • Identify which half is sorted:
    - If nums[lo] <= nums[mid]: LEFT half is sorted
    - Otherwise: RIGHT half is sorted
  • If target is in the sorted half → search that half
  • Otherwise → search the other half
  • Why this works? Because we eliminate half the search space each time
  
  THINK ABOUT:
  • What does it mean for a half to be "sorted"?
  • How do you know if target is in the sorted half?
  • Example: [4,5,6,7,0,1,2] with target=0
    - mid might be 7 (middle element)
    - Left [4,5,6,7] is sorted. Is 0 between 4 and 7? NO
    - So search RIGHT half
  
  TIME: O(log n)  SPACE: O(1)
*/
function searchInRotatedArray(nums, target) {
  // YOUR CODE HERE
}

console.log("\n=== TEST: SEARCH IN ROTATED SORTED ARRAY ===");
console.log(searchInRotatedArray([4, 5, 6, 7, 0, 1, 2], 0));      // Expected: 4
console.log(searchInRotatedArray([4, 5, 6, 7, 0, 1, 2], 3));      // Expected: -1
console.log(searchInRotatedArray([1], 1));                        // Expected: 0


/*
  6. FIND MINIMUM IN ROTATED SORTED ARRAY (LeetCode 153)
  ──────────────────────────────────────────────────────
  
  PROBLEM: Find minimum element in rotated sorted array (distinct).
  
  Example: [3, 4, 5, 1, 2] → 1
           [2, 1] → 1
           [1, 2] → 1 (not rotated)
  
  KEY INSIGHT: The minimum is at the "rotation point" where it wraps around.
  
  HINTS:
  • Use lo < hi (this converges to ONE element, which will be your answer)
  • Compare mid with the RIGHT boundary (hi):
    - If nums[mid] > nums[hi]: rotation point is to the RIGHT of mid
      → lo = mid + 1
    - If nums[mid] <= nums[hi]: rotation point is AT mid or to the LEFT
      → hi = mid (keep mid as candidate)
  • When lo === hi, you've found the minimum!
  
  THINK ABOUT:
  • Why compare with RIGHT (hi) and not left?
  • In [3,4,5,1,2]: mid=5, hi=2. 5>2, so min is right
  • In [3,1,2]: mid=1, hi=2. 1<=2, so min is at 1 or left
  
  TIME: O(log n)  SPACE: O(1)
*/
function findMin(nums) {
  // YOUR CODE HERE
}

console.log("\n=== TEST: FIND MINIMUM IN ROTATED SORTED ARRAY ===");
console.log(findMin([3, 4, 5, 1, 2]));                   // Expected: 1
console.log(findMin([2, 1]));                            // Expected: 1
console.log(findMin([1, 2]));                            // Expected: 1


/*
  7. SEARCH IN SPARSE ARRAY (CTCI 9.5)
  ─────────────────────────────────────
  
  PROBLEM: Find target in sorted array with empty strings "".
  Return -1 if not found.
  
  Example: ["at","","","","ball","","","car"] target="ball" → 4
  
  HINTS:
  • Same binary search as before, but with special handling
  • When mid lands on "", you can't compare
  • Strategy: Skip past the empty strings
  • From the right (hi), skip any trailing empties: while(strings[hi] === "") hi--
  • Check if search space still valid
  • From mid position, skip empties forward if they exist
  • Compare the non-empty string at that position
  • Continue binary search normally
  • Why skip from right? Because we know sortedness from left to right
  
  EDGE CASES:
  • What if entire array is empty strings?
  • What if target is not found?
  
  TIME: O(n) worst case (all empty)  O(log n) average
  SPACE: O(1)
*/
function searchSparseArray(strings, target) {
  // YOUR CODE HERE
}

console.log("\n=== TEST: SEARCH IN SPARSE ARRAY ===");
console.log(searchSparseArray(["at", "", "", "", "ball", "", "", "car"], "ball"));  // Expected: 4
console.log(searchSparseArray(["at", "", "", "", "ball", "", "", "car"], "car"));   // Expected: 7
console.log(searchSparseArray(["at", "", "", "", "ball", "", "", "car"], "ballcar")); // Expected: -1


// ═══════════════════════════════════════════════════════════════
// LEVEL 3: ADVANCED — Answer Space & 2D
// ═══════════════════════════════════════════════════════════════

/*
  8. BINARY SEARCH ON ANSWER (LeetCode 875 - Koko Eating Bananas)
  ──────────────────────────────────────────────────────────────
  
  PROBLEM: Find MINIMUM speed k such that Koko can eat all bananas in ≤ h hours.
  
  Example: piles=[1,1,1,1], h=4 → speed=1
           piles=[1,10,1000000000], h=2 → speed=333333334
  
  PATTERN: Binary search on the ANSWER space, not the array!
  
  HINTS:
  • Search space: lo=1, hi=max(piles)
  • We're looking for min speed where SOME CONDITION is true
  • Helper function: canFinish(speed) → returns true if eatable in h hours
    - Calculate total hours: sum of Math.ceil(pile/speed) for each pile
    - Return hours <= h
  • Binary search logic:
    - If canFinish(mid) is true: mid works! But try smaller → hi = mid
    - If canFinish(mid) is false: mid doesn't work, need larger → lo = mid + 1
  • Loop: lo < hi (converge to single answer)
  
  THINK ABOUT:
  • Why does increasing speed decrease hours?
  • At lo===hi, what have we found?
  • Why do we use lo < hi not lo <= hi?
  
  TIME: O(n log maxPile)  SPACE: O(1)
*/
function minEatingSpeed(piles, h) {
  // YOUR CODE HERE
}

console.log("\n=== TEST: MINIMUM EATING SPEED ===");
console.log(minEatingSpeed([1, 1, 1, 1], 4));            // Expected: 1
console.log(minEatingSpeed([312884132, 968299470], 968299470));  // Expected: 1
console.log(minEatingSpeed([1, 10, 1000000000], 2));     // Expected: 333333334


/*
  9. SEARCH A 2D MATRIX (LeetCode 74)
  ──────────────────────────────────
  
  PROBLEM: Search for target in m×n matrix where:
  - Row values are sorted left to right
  - Column values are sorted top to bottom
  
  Example: [[1,3,5,7],[10,11,16,20],[23,30,34,60]] target=13 → false
           [[1,3,5,7],[10,11,16,20],[23,30,34,60]] target=13 → false
  
  BIG INSIGHT: Treat the 2D matrix as a FLATTENED 1D sorted array!
  
  HINTS:
  • Binary search on indices 0 to (m*n - 1)
  • Convert flat index to 2D coordinates:
    - mid is the flat index
    - row = Math.floor(mid / cols)  ← divide by number of columns
    - col = mid % cols              ← modulo by number of columns
  • Access matrix[row][col] and compare with target
  • Standard binary search logic after that
  
  THINK ABOUT:
  • Example: 3×4 matrix (m=3, cols=4)
    - Index 0 → [0][0]
    - Index 1 → [0][1]
    - Index 4 → [1][0]  (next row!)
    - Index 5 → [1][1]
  
  TIME: O(log(m*n))  SPACE: O(1)
*/
function searchMatrix(matrix, target) {
  // YOUR CODE HERE
}

console.log("\n=== TEST: SEARCH 2D MATRIX ===");
console.log(searchMatrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13));  // Expected: false
console.log(searchMatrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3));   // Expected: true
console.log(searchMatrix([[1]], 1));                     // Expected: true


/*
  10. TIME-BASED KEY-VALUE STORE (LeetCode 981)
  ────────────────────────────────────────────
  
  PROBLEM: Implement a store with:
  • set(key, value, timestamp) - store value with timestamp
  • get(key, timestamp) - return value with MAX timestamp ≤ given timestamp
  
  Example: 
    set("foo", "bar", 1)
    get("foo", 1) → "bar"
    get("foo", 3) → "bar"  (no newer value, use old one)
    set("foo", "bar2", 4)
    get("foo", 4) → "bar2"
    get("foo", 5) → "bar2"  (5 > 4, but 4 is latest ≤ 5)
  
  HINTS:
  • Use Map to store: key → [[timestamp1, value1], [timestamp2, value2], ...]
  • Timestamps are always inserted in increasing order
  • In set(): create array if key doesn't exist, then push [timestamp, value]
  • In get(): binary search on the timestamps to find max timestamp ≤ given
  • Binary search template:
    - lo=0, hi=entries.length-1 (inclusive! exact match style)
    - When entries[mid][0] (timestamp) <= timestamp: 
      - Might be the answer! Store it: result = value
      - Try to find later timestamp: lo = mid + 1
    - Otherwise: go left: hi = mid - 1
  • Return result (or "" if nothing found)
  
  TIME: set O(1), get O(log n)  SPACE: O(n total)
*/
class TimeMap {
  constructor() {
    // YOUR CODE HERE
  }

  set(key, value, timestamp) {
    // YOUR CODE HERE
  }

  get(key, timestamp) {
    // YOUR CODE HERE
  }
}

console.log("\n=== TEST: TIME-BASED KEY-VALUE STORE ===");
const timeMap = new TimeMap();
timeMap.set("foo", "bar", 1);
console.log(timeMap.get("foo", 1));                      // Expected: "bar"
console.log(timeMap.get("foo", 3));                      // Expected: "bar"
timeMap.set("foo", "bar2", 4);
console.log(timeMap.get("foo", 4));                      // Expected: "bar2"
console.log(timeMap.get("foo", 5));                      // Expected: "bar2"


/*
  11. MEDIAN OF TWO SORTED ARRAYS (LeetCode 4) ⭐ HARD
  ────────────────────────────────────────────────────
  
  PROBLEM: Find median of two sorted arrays in O(log(min(m,n))).
  
  Example: [1,3], [2] → median = 2.0
           [1,2], [3,4] → median = 2.5
  
  ADVANCED CONCEPT: Binary search on PARTITION, not values!
  
  HINTS:
  • Ensure nums1 is the smaller array (swap if needed)
  • Binary search on partition indices of nums1
  • For each partition of nums1, calculate partition of nums2
    - mid_i = position in nums1
    - mid_j = (total elements in left half) - mid_i
  • Valid partition requires: all left elements ≤ all right elements
    - leftA <= rightB AND leftB <= rightA
  • When valid partition found:
    - Odd total? Median = max(leftA, leftB)
    - Even total? Median = (max(leftA, leftB) + min(rightA, rightB)) / 2
  • If invalid:
    - leftA > rightB? too many elements in nums1 left → hi = i - 1
    - Otherwise: too few → lo = i + 1
  
  EDGE CASES:
  • One array empty or of length 1
  • Different lengths
  
  TIME: O(log(min(m,n)))  SPACE: O(1)
*/
function findMedianSortedArrays(nums1, nums2) {
  // YOUR CODE HERE
}

console.log("\n=== TEST: MEDIAN OF TWO SORTED ARRAYS ===");
console.log(findMedianSortedArrays([1, 3], [2]));        // Expected: 2
console.log(findMedianSortedArrays([1, 2], [3, 4]));     // Expected: 2.5
console.log(findMedianSortedArrays([1], [2, 3, 4]));     // Expected: 2.5


// ═══════════════════════════════════════════════════════════════
// BONUS: EDGE CASES & TRICKY PATTERNS
// ═══════════════════════════════════════════════════════════════

/*
  12. FIRST BAD VERSION (LeetCode 278)
  ──────────────────────────────────
  
  PROBLEM: You have versions [1, 2, 3, ..., n]. Find the first bad version.
  You can call isBadVersion(x) to check if x is bad.
  
  Example: n=5, first bad=4
    isBadVersion(1)=false
    isBadVersion(2)=false
    isBadVersion(3)=false
    isBadVersion(4)=true ← FIRST BAD!
    isBadVersion(5)=true
  
  HINTS:
  • Binary search on answer pattern
  • lo=1, hi=n
  • Loop: lo < hi (converge to answer)
  • mid = Math.floor((lo + hi) / 2)
  • If isBadVersion(mid): mid COULD be answer, but try earlier
  • If NOT isBadVersion(mid): definitely not first bad, search later versions
  
  TIME: O(log n)  SPACE: O(1)
*/
function firstBadVersion(n, isBadVersion) {
  // YOUR CODE HERE
}

console.log("\n=== TEST: FIRST BAD VERSION ===");
const isBadVersion = (version) => version >= 4;
console.log(firstBadVersion(5, isBadVersion));           // Expected: 4


/*
  13. CAPACITY TO SHIP PACKAGES (LeetCode 1011)
  ─────────────────────────────────────────────
  
  PROBLEM: You must ship packages in order. Find MINIMUM capacity such that
  all packages can be shipped in ≤ days.
  
  Example: weights=[1,2,3,4,5,4,5,6,7,8,9,10], days=5
    Each day, you ship consecutive packages that fit in capacity
    Find minimum capacity to ship all in 5 days
  
  HINTS:
  • Binary search on answer: capacity in [max(weights), sum(weights)]
    - Minimum: at least big enough for largest package
    - Maximum: ship everything in one day
  • Helper: canShip(capacity) → can ship all packages in ≤ days?
    - Simulate: for each weight
      - If current + weight fits in capacity: add to current day
      - Else: start new day and put this weight on it
    - Return whether we used ≤ days
  • Binary search:
    - If canShip(mid): mid works! Try smaller → hi = mid
    - Else: need bigger capacity → lo = mid + 1
  
  TIME: O(n log(sum))  SPACE: O(1)
*/
function shipWithinDays(weights, days) {
  // YOUR CODE HERE
}

console.log("\n=== TEST: CAPACITY TO SHIP PACKAGES ===");
console.log(shipWithinDays([1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 10], 5));  // Expected: 15
console.log(shipWithinDays([3, 2, 2, 4, 1, 4], 3));      // Expected: 6


console.log("\n═══════════════════════════════════════════════════════════════");
console.log("🚀 SOLVE EACH PROBLEM ABOVE AND VERIFY YOUR TESTS!");
console.log("💡 Remember: Understand the pattern, not just memorize code");
