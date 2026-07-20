## 1. Building the Prefix Sum

```plaintext
class PrefixSum {

    constructor(nums) {
        this.prefix = new Array();
        let total = 0;
        for (let n of nums) {
            total += n; // Running sum up to and including current element
            this.prefix.push(total);
        }
    }
}
```

## 2. Range Sum Query

```plaintext
rangeSum(left, right) {
    let preRight = this.prefix[right];
    let preLeft = left > 0 ? this.prefix[left - 1] : 0; // Avoid out of bounds when left is 0
    return (preRight - preLeft);
}
```
