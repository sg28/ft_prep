# Kadane's Algorithm (Sum + Subarray)

```plaintext
function kadanes(nums) {
    let maxSum = nums[0];
    let sum = 0;
    let start = 0, end = 0;
    let left = 0;

    for (let right = 0; right < nums.length; right++) {
        if (sum < 0) {
            sum = 0;
            left = right;
        }
        sum += nums[right];
        if (sum > maxSum) {
            maxSum = sum;
            start = left;
            end = right;
        }
    }
    return { maxSum, subarray: [start, end] };
}
```
