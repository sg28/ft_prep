/*
  ════════════════════════════════════════════════════════════════
   SOLUTIONS - Check AFTER you attempt each problem
  ════════════════════════════════════════════════════════════════
*/

// ════════════════════════════════════════════════════════════════
// EASY SOLUTIONS
// ════════════════════════════════════════════════════════════════

// Problem 1: Binary Search
function search(nums, target) {
  let lo = 0, hi = nums.length;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] >= target) hi = mid;
    else lo = mid + 1;
  }

  if (lo < nums.length && nums[lo] === target) return lo;
  return -1;
}

// Problem 2: Search Insert Position
function searchInsert(nums, target) {
  let lo = 0, hi = nums.length;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] >= target) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}

// Problem 3: First Bad Version
function firstBadVersion(n) {
  let lo = 1, hi = n + 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (isBadVersion(mid)) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}

// Problem 4: Valid Perfect Square
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

// Problem 5: Find Smallest Letter
function nextGreatestLetter(letters, target) {
  const n = letters.length;
  let lo = 0, hi = n;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (letters[mid] > target) hi = mid;
    else lo = mid + 1;
  }

  return letters[lo % n];
}


// ════════════════════════════════════════════════════════════════
// MEDIUM SOLUTIONS
// ════════════════════════════════════════════════════════════════

// Problem 1: Find First and Last Position
function searchRange(nums, target) {
  function findFirst() {
    let lo = 0, hi = nums.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (nums[mid] >= target) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  }

  function findLast() {
    let lo = 0, hi = nums.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (nums[mid] > target) hi = mid;
      else lo = mid + 1;
    }
    return lo - 1;
  }

  const first = findFirst();
  if (first >= nums.length || nums[first] !== target) return [-1, -1];

  const last = findLast();
  return [first, last];
}

// Problem 2: Search in Rotated Sorted Array
function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] === target) return mid;

    // Check which half is sorted
    if (nums[lo] <= nums[mid]) {
      // Left half is sorted
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    } else {
      // Right half is sorted
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
  }

  return -1;
}

// Problem 3: Koko Eating Bananas
function minEatingSpeed(piles, h) {
  function canFinish(speed) {
    let hours = 0;
    for (const pile of piles) {
      hours += Math.ceil(pile / speed);
    }
    return hours <= h;
  }

  let lo = 1, hi = Math.max(...piles) + 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (canFinish(mid)) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}

// Problem 4: Capacity To Ship Packages
function shipWithinDays(weights, days) {
  function canShip(capacity) {
    let daysNeeded = 1, currentLoad = 0;
    for (const weight of weights) {
      if (currentLoad + weight > capacity) {
        daysNeeded++;
        currentLoad = weight;
      } else {
        currentLoad += weight;
      }
    }
    return daysNeeded <= days;
  }

  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b) + 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (canShip(mid)) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}

// Problem 5: Search 2D Matrix
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


// ════════════════════════════════════════════════════════════════
// HARD SOLUTIONS
// ════════════════════════════════════════════════════════════════

// Problem 1: Split Array Largest Sum
function splitArray(nums, k) {
  function canSplit(maxSum) {
    let splits = 1, currentSum = 0;
    for (const num of nums) {
      if (currentSum + num > maxSum) {
        splits++;
        currentSum = num;
        if (splits > k) return false;
      } else {
        currentSum += num;
      }
    }
    return true;
  }

  let lo = Math.max(...nums);
  let hi = nums.reduce((a, b) => a + b) + 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (canSplit(mid)) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}

// Problem 2: Minimize Max Distance to Gas Station
function minmaxGasDist(stations, k) {
  function canPlace(maxDist) {
    let needed = 0;
    for (let i = 1; i < stations.length; i++) {
      const gap = stations[i] - stations[i - 1];
      needed += Math.floor(gap / maxDist);
    }
    return needed <= k;
  }

  let lo = 0, hi = stations[stations.length - 1] - stations[0];

  while (hi - lo > 1e-6) {
    const mid = (lo + hi) / 2;
    if (canPlace(mid)) hi = mid;
    else lo = mid;
  }

  return lo;
}

// Problem 3: Median of Two Sorted Arrays
function findMedianSortedArrays(nums1, nums2) {
  // Ensure nums1 is the smaller array
  if (nums1.length > nums2.length) {
    [nums1, nums2] = [nums2, nums1];
  }

  const m = nums1.length;
  const n = nums2.length;
  let lo = 0, hi = m;

  while (lo <= hi) {
    const partition1 = Math.floor((lo + hi) / 2);
    const partition2 = Math.floor((m + n + 1) / 2) - partition1;

    const maxLeft1 = partition1 === 0 ? -Infinity : nums1[partition1 - 1];
    const minRight1 = partition1 === m ? Infinity : nums1[partition1];

    const maxLeft2 = partition2 === 0 ? -Infinity : nums2[partition2 - 1];
    const minRight2 = partition2 === n ? Infinity : nums2[partition2];

    if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
      // Found correct partition
      if ((m + n) % 2 === 0) {
        return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;
      } else {
        return Math.max(maxLeft1, maxLeft2);
      }
    } else if (maxLeft1 > minRight2) {
      hi = partition1 - 1;
    } else {
      lo = partition1 + 1;
    }
  }

  throw new Error("Arrays are not sorted");
}


// ════════════════════════════════════════════════════════════════
// PATTERN OBSERVATIONS
// ════════════════════════════════════════════════════════════════

/*
NOTICE THE PATTERNS:

1. ARRAY SEARCH:
   - Always: lo = 0, hi = nums.length
   - CONDITION: nums[mid] >= target (first occurrence)
   - CONDITION: nums[mid] > target (last occurrence)

2. ANSWER SPACE SEARCH:
   - Range: [min possible, max possible + 1]
   - CONDITION: canDoIt(mid) - helper function
   - Examples: Koko bananas, ship packages, split array

3. 2D → 1D CONVERSION:
   - row = Math.floor(mid / n)
   - col = mid % n

4. SPECIAL CASES:
   - Rotated array: Uses lo <= hi (classic template)
   - Float precision: while (hi - lo > 1e-6)
   - Median: Partition-based approach

THE UNIVERSAL PATTERN WORKS FOR 95% OF PROBLEMS.
The other 5% need slight modifications but same core logic.
*/
