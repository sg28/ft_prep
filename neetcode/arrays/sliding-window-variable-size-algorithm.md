## 1. Longest <span style="color: rgb(229, 87, 87);">Subarray</span> With <span style="color: rgb(229, 87, 87);">Same Value</span>

```plaintext
function longestSubarray(nums) {
    let length = 0;
    let L = 0;

    for (let R = 0; R < nums.length; R++) {
        if (nums[L] != nums[R]) {
            L = R;
        }
        length = Math.max(length, R - L + 1);
    }
    return length;
}
```

## 2. Shortest Subarray With <span style="color: rgb(229, 87, 87);">Total = Target</span>

```plaintext
function shortestSubarray(nums, target) {
    let L = 0, total = 0;
    let length = Infinity;

    for (let R = 0; R < nums.length; R++) {
        total = total + nums[R];
        while (total >= target) {
            length = Math.min(R - L + 1, length);
            total = total - nums[L];
            L++;
        }
    }
    if (length == Infinity) return 0;
    return length;
}
```
