## 1. Palindrome Check

```plaintext
function isPalindrome(word) {
    let L = 0, R = word.length - 1;
    while (L < R) {
        if (word.charAt(L) != word.charAt(R)) {
            return false;
        }
        L++;
        R--;
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
            R--;
        } else if (nums[L] + nums[R] < target) {
            L++;
        } else {
            return [L, R];
        }
    }
    return null;
}
```
