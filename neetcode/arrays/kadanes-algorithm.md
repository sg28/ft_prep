# Kadane's Algorithm (Sum + Subarray)

```plaintext
function kadanes(nums) {
    let maxSum = nums[0];
    let currentSum = 0;
    let start = 0, end = 0;
    let left = 0;

    for (let right = 0; right < nums.length; right++) {
        if (currentSum < 0) {
            currentSum = 0;
            left = right;
        }
        currentSum += nums[right];
        if (currentSum > maxSum) {
            maxSum = currentSum;
            start = left;
            end = right;
        }
    }
    return { maxSum, subarray: [start, end] };
}
```
