
/*
    Given an integer array nums, find the contiguous subarray (containing at least one number) 
    that has the largest product and return its product.

*/


export default function maxProductSubArray(numbers) {
  let currentMax = numbers[0];
  let currentMin = numbers[0];
  let best = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    let temp = currentMax;
    currentMax = Math.max(numbers[i], numbers[i] * currentMax, numbers[i] * currentMin);
    currentMin = Math.min(numbers[i], numbers[i] * temp, numbers[i] * currentMin);
    best = Math.max(best, currentMax);
  }

  return best;
}
