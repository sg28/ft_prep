function hasPairWithSum(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];

    // Case A: If sum is exactly equal to the target
    if (sum === target) {
      // → Found the pair, return true
      return true;
    } else if (sum < target) {
      // Case B: Sum is too small
      // → Move left pointer to increase the sum
      left++;
    } else {
      // Case C: Sum is too large
      // → Move right pointer to decrease the sum
      right--;
    }
  }

  return false;
}
