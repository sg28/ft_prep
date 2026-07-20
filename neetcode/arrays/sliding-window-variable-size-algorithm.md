## 1. Longest Subarray With Same Value

```plaintext
function longestSubarray(nums) {
    let length = 0;
    let L = 0;

    for (let R = 0; R < nums.length; R++) {
        if (nums[L] != nums[R]) {
            L = R; // New value encountered, shrink window to R
        }
        length = Math.max(length, R - L + 1);
    }
    return length;
}
```

## 2. Shortest Subarray With Sum >= Target

```plaintext
function shortestSubarray(nums, target) {
    let L = 0, total = 0;
    let length = Infinity;

    for (let R = 0; R < nums.length; R++) {
        total += nums[R]; // Expand window from the right
        while (total >= target) {
            length = Math.min(R - L + 1, length);
            total -= nums[L]; // Shrink window from the left
            L++;
        }
    }

    if (length == Infinity) {
        return 0;
    }
    return length;
}
```
