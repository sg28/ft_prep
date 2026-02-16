/*
  ════════════════════════════════════════════════════════════════
   HARD PROBLEMS (3 problems, ~30-45 minutes)
  ════════════════════════════════════════════════════════════════

  UNIVERSAL PATTERN:

  let lo = START, hi = END;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (CONDITION) hi = mid;
    else lo = mid + 1;
  }
  return lo;
*/

// ════════════════════════════════════════════════════════════════
// PROBLEM 1: Split Array Largest Sum (LeetCode 410)
// ════════════════════════════════════════════════════════════════

/*
Given an array nums and integer k, split nums into k non-empty subarrays
such that the largest sum among these subarrays is minimized.

Return the minimized largest sum.

Example:
  Input: nums = [7,2,5,10,8], k = 2
  Output: 18
  Explanation:
    Best split: [7,2,5] and [10,8]
    Largest sum = max(14, 18) = 18

  Input: nums = [1,2,3,4,5], k = 2
  Output: 9
  Explanation: [1,2,3,4] and [5], max(10,5)=10 OR [1,2,3] and [4,5], max(6,9)=9

Hint: Binary search on max sum [max(nums), sum(nums)], CONDITION: canSplit(maxSum, k)
*/

function splitArray(nums, k) {
  // TODO: Implement
  // Helper: canSplit(maxSum, k) - can we split into k subarrays with max sum <= maxSum?
}

console.log("=== PROBLEM 1: Split Array Largest Sum ===");
console.log(splitArray([7,2,5,10,8], 2));  // Expected: 18
console.log(splitArray([1,2,3,4,5], 2));   // Expected: 9


// ════════════════════════════════════════════════════════════════
// PROBLEM 2: Minimize Max Distance to Gas Station (LeetCode 774)
// ════════════════════════════════════════════════════════════════

/*
On a horizontal line, we have gas stations at positions stations[0], stations[1], ..., stations[n-1].
Now, we add k more gas stations so that the maximum distance between adjacent stations is minimized.
Return the smallest possible value of the maximum distance.

Example:
  Input: stations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k = 9
  Output: 0.5
  Explanation: Add one station between each pair

  Input: stations = [23,24,36,39,46,56,57,65,84,98], k = 1
  Output: 14.0
  Explanation: Add at position 50, max distance = 14

Hint: Binary search on distance [0, max gap], CONDITION: canPlace(maxDist, k)
Note: Use precision 1e-6 for floating point
*/

function minmaxGasDist(stations, k) {
  // TODO: Implement
  // Helper: canPlace(maxDist, k) - can we add k stations with max dist <= maxDist?
  // Note: Use while (hi - lo > 1e-6) for float precision
}

console.log("\n=== PROBLEM 2: Minimize Max Distance ===");
console.log(minmaxGasDist([1,2,3,4,5,6,7,8,9,10], 9).toFixed(1));      // Expected: 0.5
console.log(minmaxGasDist([23,24,36,39,46,56,57,65,84,98], 1).toFixed(1)); // Expected: 14.0


// ════════════════════════════════════════════════════════════════
// PROBLEM 3: Median of Two Sorted Arrays (LeetCode 4)
// ════════════════════════════════════════════════════════════════

/*
Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.
The overall run time complexity should be O(log (m+n)).

Example:
  Input: nums1 = [1,3], nums2 = [2]
  Output: 2.0
  Explanation: merged = [1,2,3], median = 2

  Input: nums1 = [1,2], nums2 = [3,4]
  Output: 2.5
  Explanation: merged = [1,2,3,4], median = (2+3)/2 = 2.5

Hint: Binary search on partition point in smaller array
This is the hardest binary search problem - don't worry if it takes time!
*/

function findMedianSortedArrays(nums1, nums2) {
  // TODO: Implement
  // This one is complex - focus on partitioning the smaller array
}

console.log("\n=== PROBLEM 3: Median of Two Sorted Arrays ===");
console.log(findMedianSortedArrays([1,3], [2]));     // Expected: 2.0
console.log(findMedianSortedArrays([1,2], [3,4]));   // Expected: 2.5


// ════════════════════════════════════════════════════════════════
// CONGRATULATIONS!
// ════════════════════════════════════════════════════════════════

/*
If you solved all 3 hard problems:
✓ You've mastered binary search
✓ You can handle interview questions
✓ You understand the universal pattern deeply

You're now in the top 5% of developers for binary search skills.

Next: Check solutions.js to compare your approach
*/
