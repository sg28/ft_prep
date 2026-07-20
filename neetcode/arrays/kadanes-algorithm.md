## 1. Brute Force

```plaintext
function bruteForce(nums) {
    let maxSum = nums[0];

    for (let L = 0; L < nums.length; L++) {
        let curSum = 0;
        for (let R = L; R < nums.length; R++) {
            curSum += nums[R]; // Extend subarray to the right
            maxSum = Math.max(maxSum, curSum); // Track largest sum seen
        }
    }
    return maxSum;
}
```

## 2. Kadane's Algorithm

```plaintext
function kadanes(nums) {
    let maxSum = nums[0];
    let curSum = 0;

    for (let n of nums) {
        curSum = Math.max(curSum, 0); // Discard a negative running sum, start fresh
        curSum += n;
        maxSum = Math.max(maxSum, curSum);
    }
    return maxSum;
}
```

## 3. Sliding Window (Returning the Subarray)

```plaintext
function slidingWindow(nums) {
    let maxSum = nums[0];
    let curSum = 0;
    let maxL = 0, maxR = 0;
    let L = 0;

    for (let R = 0; R < nums.length; R++) {
        if (curSum < 0) {
            curSum = 0; // Reset window, constraint was broken
            L = R;
        }
        curSum += nums[R];
        if (curSum > maxSum) {
            maxSum = curSum;
            maxL = L;
            maxR = R;
        }
    }
    return [maxL, maxR];
}
```
