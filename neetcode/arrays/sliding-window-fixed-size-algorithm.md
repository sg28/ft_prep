## 1. Brute Force

```plaintext
function closeDuplicatesBruteForce(nums, k) {
    for (let L = 0; L < nums.length; L++) {
        for (let R = L + 1; R < Math.min(nums.length, L + k); R++) {
            if (nums[L] == nums[R]) {
                return true; // Duplicate found within window of size k
            }
        }
    }
    return false;
}
```

## 2. Sliding Window (Fixed Size)

```plaintext
function closeDuplicates(nums, k) {
    let window = new Set(); // Current window of size <= k
    let L = 0;

    for (let R = 0; R < nums.length; R++) {
        if (R - L + 1 > k) {
            window.delete(nums[L]); // Shrink window from the left
            L++;
        }
        if (window.has(nums[R])) {
            return true; // Duplicate already in the window
        }
        window.add(nums[R]);
    }
    return false;
}
```
