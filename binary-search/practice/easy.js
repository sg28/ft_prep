/*
  ════════════════════════════════════════════════════════════════
   EASY PROBLEMS (5 problems, ~30-45 minutes)
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
// PROBLEM 1: Binary Search (LeetCode 704)
// ════════════════════════════════════════════════════════════════

/*
Given a sorted array nums and a target value, return the index of target.
If not found, return -1.

Example:
  Input: nums = [1,3,5,7,9], target = 5
  Output: 2

  Input: nums = [1,3,5,7,9], target = 4
  Output: -1

Hint: Use CONDITION: nums[mid] >= target
*/

function search(nums, target) {
  let low = 0;
  let high = nums.length;
  while(low < high){
    let mid = Math.floor((low + high)/2);
    if(nums[mid] >= target) high = mid;
    else low = mid+1;
  }
  if(low < nums.length && nums[low] === target) return low;
  else return -1;
}

console.log("=== PROBLEM 1: Binary Search ===");
console.log(search([1,3,5,7,9], 5));  // Expected: 2
console.log(search([1,3,5,7,9], 4));  // Expected: -1
console.log(search([5], 5));          // Expected: 0


// ════════════════════════════════════════════════════════════════
// PROBLEM 2: Search Insert Position (LeetCode 35)
// ════════════════════════════════════════════════════════════════

/*
Given a sorted array and a target, return the index where target would be inserted.

Example:
  Input: nums = [1,3,5,6], target = 5
  Output: 2

  Input: nums = [1,3,5,6], target = 2
  Output: 1

  Input: nums = [1,3,5,6], target = 7
  Output: 4

Hint: Same as Problem 1 but simpler - just return lo
*/

function searchInsert(nums, target) {
  let low = 0;
  let high = nums.length;
  while(low < high){
    let mid = Math.floor((low+high) / 2);
    if(nums[mid]>= target) high = mid;
    else low = mid + 1;
  }
  return low;
}

console.log("\n=== PROBLEM 2: Search Insert Position ===");
console.log(searchInsert([1,3,5,6], 5));  // Expected: 2
console.log(searchInsert([1,3,5,6], 2));  // Expected: 1
console.log(searchInsert([1,3,5,6], 7));  // Expected: 4


// ════════════════════════════════════════════════════════════════
// PROBLEM 3: First Bad Version (LeetCode 278)
// ════════════════════════════════════════════════════════════════

/*
You are a product manager and currently leading a team to develop a new product.
Unfortunately, the latest version failed the quality check. Since each version
is developed based on the previous version, all versions after a bad version are bad.

Given n versions [1, 2, ..., n], find the first bad one.

You have access to isBadVersion(version) API which returns true if version is bad.

Example:
  n = 5, bad = 4
  isBadVersion(3) → false
  isBadVersion(4) → true
  isBadVersion(5) → true
  Output: 4

Hint: CONDITION is isBadVersion(mid)
*/

// Mock API (don't change this)
let badVersion = 4;
const isBadVersion = (version) => version >= badVersion;

function firstBadVersion(n) {
  // TODO: Implement
}

console.log("\n=== PROBLEM 3: First Bad Version ===");
badVersion = 4;
console.log(firstBadVersion(5));  // Expected: 4
badVersion = 1;
console.log(firstBadVersion(1));  // Expected: 1


// ════════════════════════════════════════════════════════════════
// PROBLEM 4: Valid Perfect Square (LeetCode 367)
// ════════════════════════════════════════════════════════════════

/*
Given a positive integer num, return true if num is a perfect square.
A perfect square is an integer that is the square of an integer.
Do not use Math.sqrt().

Example:
  Input: num = 16
  Output: true (4 * 4 = 16)

  Input: num = 14
  Output: false

Hint: Search range [1, num+1], CONDITION: mid * mid >= num
*/

function isPerfectSquare(num) {
  // TODO: Implement
}

console.log("\n=== PROBLEM 4: Valid Perfect Square ===");
console.log(isPerfectSquare(16));  // Expected: true
console.log(isPerfectSquare(14));  // Expected: false
console.log(isPerfectSquare(1));   // Expected: true


// ════════════════════════════════════════════════════════════════
// PROBLEM 5: Find Smallest Letter Greater Than Target (LeetCode 744)
// ════════════════════════════════════════════════════════════════

/*
Given a sorted array of characters letters and a character target,
return the smallest character in letters that is greater than target.

Note: Letters wrap around. If no such character exists, return letters[0].

Example:
  Input: letters = ["c","f","j"], target = "a"
  Output: "c"

  Input: letters = ["c","f","j"], target = "c"
  Output: "f"

  Input: letters = ["c","f","j"], target = "d"
  Output: "f"

  Input: letters = ["c","f","j"], target = "j"
  Output: "c" (wraps around)

Hint: CONDITION: letters[mid] > target, then return letters[lo % n]
*/

function nextGreatestLetter(letters, target) {
  // TODO: Implement
}

console.log("\n=== PROBLEM 5: Find Smallest Letter ===");
console.log(nextGreatestLetter(["c","f","j"], "a"));  // Expected: "c"
console.log(nextGreatestLetter(["c","f","j"], "c"));  // Expected: "f"
console.log(nextGreatestLetter(["c","f","j"], "d"));  // Expected: "f"
console.log(nextGreatestLetter(["c","f","j"], "j"));  // Expected: "c"


// ════════════════════════════════════════════════════════════════
// DONE WITH EASY!
// ════════════════════════════════════════════════════════════════

/*
If you solved all 5 problems:
✓ You understand the universal pattern
✓ You can identify the right CONDITION
✓ You're ready for medium problems

Next: Open medium.js
*/
