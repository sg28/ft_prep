

/*
    General pattern for Binary Search.
*/
// Template A — Exact match (find target index)
// Why lo <= hi? Because hi is INCLUSIVE (nums.length - 1)
// Loop runs while ≥1 element exists. Must use mid±1 to avoid infinite loop.
// Ends when lo > hi (search space empty).
//
// How lo/hi move (example: search 7 in [1,3,5,7,9,11]):
//   Initial:     lo=0, hi=5, mid=2 → nums[2]=5 < 7 → move lo right
//   Iteration 2: lo=3, hi=5, mid=4 → nums[4]=9 > 7 → move hi left
//   Iteration 3: lo=3, hi=3, mid=3 → nums[3]=7 ✓ found!
function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;  // lo/hi are BOUNDARY POINTERS

  while (lo <= hi) {  // while search space [lo..hi] has elements
    const mid = Math.floor((lo + hi) / 2);  // check middle

    if (nums[mid] === target) return mid;   // found
    if (nums[mid] < target) lo = mid + 1;   // eliminate left half, move lo→
    else hi = mid - 1;                      // eliminate right half, move hi←
  }
  return -1;  // lo > hi means pointers crossed, not found
}


// Template B — Lower Bound (first index with nums[i] >= target)
// Why lo < hi? Because hi is EXCLUSIVE (nums.length, not -1)
// Loop runs while ≥2 elements exist. Can safely do hi = mid (no -1).
// Ends when lo == hi (converged to insertion point).
//
// How lo/hi converge (example: lowerBound of 4 in [1,2,4,4,4,7,9]):
//   Initial:     lo=0, hi=7, mid=3 → nums[3]=4 >= 4 → keep mid, move hi left
//   Iteration 2: lo=0, hi=3, mid=1 → nums[1]=2 < 4  → move lo right
//   Iteration 3: lo=2, hi=3, mid=2 → nums[2]=4 >= 4 → keep mid, move hi left
//   Final:       lo=2, hi=2 → CONVERGED! Return 2 (first index of 4)
function lowerBound(nums, target) {
  let lo = 0, hi = nums.length;  // lo/hi define search space [lo, hi)

  while (lo < hi) {  // while space has ≥2 elements, keep narrowing
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] >= target) hi = mid;  // mid could be answer, keep it
    else lo = mid + 1;                  // eliminate left half, move lo→
  }
  return lo;  // lo == hi (pointers converged to the answer)
}


// Upper Bound (first index with nums[i] > target) — optional but very useful
// Same as lowerBound: hi is EXCLUSIVE, so use lo < hi
function upperBound(nums, target) {
  let lo = 0, hi = nums.length;  // hi is EXCLUSIVE

  while (lo < hi) {  // < because we converge until lo == hi
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] > target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}



// Template C — Binary search on answer (minimum value that “works”)
// Why lo < hi? We're searching in range [lo, hi) for min feasible value.
// hi is treated as EXCLUSIVE. Converges to the answer at lo == hi.
function binarySearchOnAnswer(lo, hi, ok) { // ok(x): false..false true..true
  while (lo < hi) {  // < because we converge until lo == hi
    const mid = Math.floor((lo + hi) / 2);

    if (ok(mid)) hi = mid;      // works -> try smaller
    else lo = mid + 1;          // fails -> need bigger
  }
  return lo;
}

// ─────────────────────────────────────────────────────────────────
// Applied Problems (from Cracking the Coding Interview, Ch 9)
// ─────────────────────────────────────────────────────────────────

/*
  Binary Search (LeetCode 704)
  ----------------------------
  QUESTION: Given a sorted array of integers and a target,
  return the index if found, else -1.

  Uses Template A (exact match).
  Time: O(log n)  |  Space: O(1)
*/
// binarySearch is implemented above.

/*
    Search in Rotated Sorted Array (CTCI 9.3)
    -----------------------------------------
    QUESTION: Given a sorted array that has been rotated at an unknown pivot,
    find the index of a target value. Return -1 if not found.
    
    Example 1: nums = [15,16,19,20,25,1,3,4,5,7,10,14], target = 5
               Output: 8 (nums[8] = 5)
    
    Example 2: nums = [4,5,6,7,0,1,2], target = 0
               Output: 4
    
    Example 3: nums = [4,5,6,7,0,1,2], target = 3
               Output: -1 (not found)

    Key insight: At least one half (lo..mid or mid..hi) is always
    normally sorted. Check if target falls in the sorted half;
    if yes, search there, otherwise search the other half.

    Uses Template A skeleton with extra logic to handle rotation.
    Time: O(log n)  |  Space: O(1)
    Note: With duplicates, worst case degrades to O(n).
*/
function searchRotatedArray(nums, target) {
  let lo = 0, hi = nums.length - 1;  // hi is INCLUSIVE

  while (lo <= hi) {  // Uses Template A pattern (exact match)
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] === target) return mid;

    // Left half is normally sorted
    if (nums[lo] <= nums[mid]) {
      if (target >= nums[lo] && target < nums[mid]) {
        hi = mid - 1;       // target is in the sorted left half
      } else {
        lo = mid + 1;       // target is in the right half
      }
    }
    // Right half is normally sorted
    else {
      if (target > nums[mid] && target <= nums[hi]) {
        lo = mid + 1;       // target is in the sorted right half
      } else {
        hi = mid - 1;       // target is in the left half
      }
    }
  }
  return -1;
}


/*
    Find Minimum in Rotated Sorted Array (CTCI Pattern Matching, p.40-41)
    ---------------------------------------------------------------------
    QUESTION: Given a rotated sorted array (with distinct elements),
    find the minimum element.
    
    Example 1: nums = [3,4,5,6,7,1,2]
               Output: 1
    
    Example 2: nums = [2,3,4,5,1]
               Output: 1
    
    Example 3: nums = [1,2,3,4,5]  (not rotated)
               Output: 1

    Key insight: The "reset point" where the array wraps around is the minimum.
    Compare nums[mid] with nums[hi] to decide which half holds the min.

    Uses Template B skeleton (lo < hi, converge to one element).
    Time: O(log n)  |  Space: O(1)
*/
function findMinInRotatedArray(nums) {
  let lo = 0, hi = nums.length - 1;  // Note: hi is inclusive BUT...

  while (lo < hi) {  // ...we use < to converge (Template B style)
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] > nums[hi]) lo = mid + 1;  // min is in right half
    else hi = mid;                            // min is mid or left
  }
  return nums[lo];
}


/*
    Search a 2D Matrix (LeetCode 74)
    -------------------------------
    QUESTION: Given an m x n matrix with rows sorted and each row's
    first element greater than the previous row's last element,
    determine if target exists.

    Treat matrix as a flattened sorted array of length m*n.
    Time: O(log(m*n))  |  Space: O(1)
*/
function searchMatrix(matrix, target) {
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) return false;
  const rows = matrix.length;
  const cols = matrix[0].length;

  let lo = 0, hi = rows * cols - 1;  // inclusive

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const r = Math.floor(mid / cols);
    const c = mid % cols;
    const value = matrix[r][c];

    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}


/*
    Koko Eating Bananas (LeetCode 875)
    ----------------------------------
    QUESTION: Given piles of bananas and h hours, find the minimum
    integer speed k so Koko can eat all bananas in h hours.

    Binary search on answer: k in [1, maxPile].
    Time: O(n log maxPile)  |  Space: O(1)
*/
function minEatingSpeed(piles, h) {
  let lo = 1;
  let hi = 1;
  for (const pile of piles) hi = Math.max(hi, pile);

  const canFinish = (speed) => {
    let hours = 0;
    for (const pile of piles) {
      hours += Math.ceil(pile / speed);
      if (hours > h) return false;
    }
    return hours <= h;
  };

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (canFinish(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}


/*
    Search in Sparse (String) Array (CTCI 9.5)
    -------------------------------------------
    QUESTION: Given a sorted array of strings that is interspersed with
    empty strings "", write a method to find the location of a given string.
    Return -1 if not found.
    
    Example 1: strings = ["at","","","","ball","","","car","","","dad","",""],
               target = "ball"
               Output: 4
    
    Example 2: strings = ["at","","","","ball","","","car","","","dad","",""],
               target = "car"
               Output: 7
    
    Example 3: strings = ["at","","","","ball","","","car","","","dad","",""],
               target = "ballcar"
               Output: -1 (not found)

    Key insight: When mid lands on "", scan right to find the next
    non-empty string. If none found in [mid..hi], search left half.

    Uses Template A skeleton with empty-string handling.
    Time: O(n) worst case (all empty)  |  O(log n) average
*/
function searchSparseArray(strings, target) {
  if (!strings || !target) return -1;
  if (target === "") {
    for (let i = 0; i < strings.length; i++) {
      if (strings[i] === "") return i;
    }
    return -1;
  }

  let lo = 0, hi = strings.length - 1;  // hi is INCLUSIVE

  while (lo <= hi) {  // Uses Template A pattern (exact match)
    // Shrink hi past trailing empties
    while (lo <= hi && strings[hi] === "") hi--;
    if (hi < lo) return -1;

    let mid = Math.floor((lo + hi) / 2);

    // If mid is empty, advance to next non-empty
    while (strings[mid] === "") mid++;

    if (strings[mid] === target) return mid;
    if (strings[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}


/*
    Time Based Key-Value Store (LeetCode 981)
    -----------------------------------------
    QUESTION: Implement a time-based key-value store with set and get.
    get returns the value with the greatest timestamp <= given timestamp.

    Store list of [timestamp, value] per key, binary search on timestamps.
    Time: set O(1), get O(log n)  |  Space: O(n)
*/
class TimeMap {
  constructor() {
    this.store = new Map();
  }

  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }

  get(key, timestamp) {
    const entries = this.store.get(key);
    if (!entries) return "";

    let lo = 0, hi = entries.length - 1;
    let result = "";

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const [ts, val] = entries[mid];

      if (ts <= timestamp) {
        result = val;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return result;
  }
}


/*
    Median of Two Sorted Arrays (LeetCode 4)
    ----------------------------------------
    QUESTION: Given two sorted arrays nums1 and nums2, return the median.

    Binary search on partition of smaller array.
    Time: O(log(min(m,n)))  |  Space: O(1)
*/
function findMedianSortedArrays(nums1, nums2) {
  if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);

  const m = nums1.length;
  const n = nums2.length;
  let lo = 0, hi = m;
  const half = Math.floor((m + n + 1) / 2);

  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2);
    const j = half - i;

    const leftA = i === 0 ? -Infinity : nums1[i - 1];
    const rightA = i === m ? Infinity : nums1[i];
    const leftB = j === 0 ? -Infinity : nums2[j - 1];
    const rightB = j === n ? Infinity : nums2[j];

    if (leftA <= rightB && leftB <= rightA) {
      if ((m + n) % 2 === 0) {
        return (Math.max(leftA, leftB) + Math.min(rightA, rightB)) / 2;
      }
      return Math.max(leftA, leftB);
    }

    if (leftA > rightB) hi = i - 1;
    else lo = i + 1;
  }

  return 0;
}