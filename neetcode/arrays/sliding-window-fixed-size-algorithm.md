## Sliding Window (Fixed Size)

```plaintext
function closeDuplicates(nums, k) {
    let window = new Set(); // Current window of size <= k
    let leftIndex = 0;

    for (let rightIndex = 0; rightIndex < nums.length; rightIndex++) {
        if (rightIndex - leftIndex + 1 > k) {
            window.delete(nums[leftIndex]); // Shrink window from the left
            leftIndex++;
        }
        if (window.has(nums[rightIndex])) {
            return true; // Duplicate already in the window
        }
        window.add(nums[rightIndex]);
    }
    return false;
}
```
