## Sliding Window (Fixed Size)

```plaintext
function closeDuplicates(nums, k) {
    let window = new Set();
    let leftIndex = 0;

    for (let rightIndex = 0; rightIndex < nums.length; rightIndex++) {
        if (rightIndex - leftIndex + 1 > k) {
            window.delete(nums[leftIndex]);
            leftIndex++;
        }
        if (window.has(nums[rightIndex])) {
            return true;
        }
        window.add(nums[rightIndex]);
    }
    return false;
}
```