/*

Given an integer array nums, find the contiguous subarray (containing at least one number) 
which has the largest sum and return its sum.

Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.

Input: nums = [1]
Output: 1

Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: [5,4,-1,7,8] has the largest sum = 23.

*/



export default function maxSumSubArray(numbers) {
  let current = numbers[0];
  let best = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    current = Math.max(numbers[i], current + numbers[i]);
    best = Math.max(best, current);
  }

  return best;
}
