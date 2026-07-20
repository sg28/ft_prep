## 1. Palindrome Check

```plaintext
function isPalindrome(word) {
    let L = 0, R = word.length - 1;
    while (L < R) {
        if (word.charAt(L) != word.charAt(R)) {
            return false;
        }
        L++; // Move left pointer inward
        R--; // Move right pointer inward
    }
    return true;
}
```

## 2. Target Sum (Sorted Array)

```plaintext
function targetSum(nums, target) {
    let L = 0, R = nums.length - 1;
    while (L < R) {
        if (nums[L] + nums[R] > target) {
            R--; // Sum too large, shrink from the right
        } else if (nums[L] + nums[R] < target) {
            L++; // Sum too small, grow from the left
        } else {
            return [L, R];
        }
    }
    return null;
}
```
