/*
  ════════════════════════════════════════════════════════════════
   MEDIUM PROBLEMS (5 problems, ~45-60 minutes)
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
// PROBLEM 1: Find First and Last Position (LeetCode 34)
// ════════════════════════════════════════════════════════════════

/*
Given a sorted array nums and target, find the starting and ending position of target.
If target is not found, return [-1, -1].

Example:
  Input: nums = [5,7,7,8,8,10], target = 8
  Output: [3,4]

  Input: nums = [5,7,7,8,8,10], target = 6
  Output: [-1,-1]

Hint: Find first using nums[mid] >= target, find last using nums[mid] > target
*/

function searchRange(nums, target) {
  // TODO: Implement findFirst and findLast
}

console.log("=== PROBLEM 1: Find First and Last Position ===");
console.log(searchRange([5,7,7,8,8,10], 8));  // Expected: [3,4]
console.log(searchRange([5,7,7,8,8,10], 6));  // Expected: [-1,-1]
console.log(searchRange([1], 1));             // Expected: [0,0]


// ════════════════════════════════════════════════════════════════
// PROBLEM 2: Search in Rotated Sorted Array (LeetCode 33)
// ════════════════════════════════════════════════════════════════

/*
A sorted array has been rotated at some pivot.
Find target and return its index, or -1 if not found.

Example:
  Input: nums = [4,5,6,7,0,1,2], target = 0
  Output: 4

  Input: nums = [4,5,6,7,0,1,2], target = 3
  Output: -1

Hint: Check which half is sorted, then decide which side to search
*/

function searchRotated(nums, target) {
  // TODO: Implement
  // Hint: This one is trickier - check if left or right half is sorted first
}

console.log("\n=== PROBLEM 2: Search in Rotated Array ===");
console.log(searchRotated([4,5,6,7,0,1,2], 0));  // Expected: 4
console.log(searchRotated([4,5,6,7,0,1,2], 3));  // Expected: -1
console.log(searchRotated([1], 0));              // Expected: -1


// ════════════════════════════════════════════════════════════════
// PROBLEM 3: Koko Eating Bananas (LeetCode 875)
// ════════════════════════════════════════════════════════════════

/*
Koko loves to eat bananas. There are n piles of bananas.
Koko has h hours to eat all bananas. Each hour, she eats k bananas from one pile.
If pile has less than k bananas, she eats all and won't eat from another pile.

Find the minimum eating speed k.

Example:
  Input: piles = [3,6,7,11], h = 8
  Output: 4
  Explanation: With speed 4: 1+2+2+3 = 8 hours

  Input: piles = [30,11,23,4,20], h = 5
  Output: 30
  Explanation: Each pile in one hour

Hint: Binary search on speed [1, max(piles)], CONDITION: canFinish(speed)
*/

function minEatingSpeed(piles, h) {
  // TODO: Implement
  // Helper: canFinish(speed) - can we eat all bananas in h hours?
}

console.log("\n=== PROBLEM 3: Koko Eating Bananas ===");
console.log(minEatingSpeed([3,6,7,11], 8));      // Expected: 4
console.log(minEatingSpeed([30,11,23,4,20], 5)); // Expected: 30


// ════════════════════════════════════════════════════════════════
// PROBLEM 4: Capacity To Ship Packages (LeetCode 1011)
// ════════════════════════════════════════════════════════════════

/*
A conveyor belt has packages that must be shipped within days days.
The ith package has weight weights[i].
Each day, we load packages on the ship in order.
We cannot load more than the maximum weight capacity.

Find the minimum ship capacity.

Example:
  Input: weights = [1,2,3,4,5,6,7,8,9,10], days = 5
  Output: 15
  Explanation:
    Day 1: 1,2,3,4,5
    Day 2: 6,7
    Day 3: 8
    Day 4: 9
    Day 5: 10

Hint: Binary search on capacity [max(weights), sum(weights)], CONDITION: canShip(capacity)
*/

function shipWithinDays(weights, days) {
  // TODO: Implement
  // Helper: canShip(capacity) - can we ship all in days?
}

console.log("\n=== PROBLEM 4: Ship Packages ===");
console.log(shipWithinDays([1,2,3,4,5,6,7,8,9,10], 5));  // Expected: 15
console.log(shipWithinDays([3,2,2,4,1,4], 3));          // Expected: 6


// ════════════════════════════════════════════════════════════════
// PROBLEM 5: Search a 2D Matrix (LeetCode 74)
// ════════════════════════════════════════════════════════════════

/*
Given an m x n matrix where:
- Each row is sorted
- First integer of each row is greater than last integer of previous row

Search for a target value.

Example:
  Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
  Output: true

  Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13
  Output: false

Hint: Treat as 1D array, convert indices with row = mid/n, col = mid%n
*/

function searchMatrix(matrix, target) {
  // TODO: Implement
}

console.log("\n=== PROBLEM 5: Search 2D Matrix ===");
console.log(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3));  // Expected: true
console.log(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13)); // Expected: false


// ════════════════════════════════════════════════════════════════
// DONE WITH MEDIUM!
// ════════════════════════════════════════════════════════════════

/*
If you solved all 5 problems:
✓ You can apply the pattern to complex scenarios
✓ You understand answer space binary search
✓ You're ready for hard problems

Next: Open hard.js
*/
