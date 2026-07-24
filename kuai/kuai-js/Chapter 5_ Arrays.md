# Chapter 5: Arrays

## Section 1: Arrays

JavaScript arrays are ordered, resizable collections that are mutable and can hold mixed data types.

### Creating and Accessing Arrays

- **Initialization**: Arrays can be created with square brackets `[]`, holding any combination of data types.

  ```javascript
  const myList = [1, 'hello', 3.14];
  ```

- **Element Access**: Elements are accessed via their index. JavaScript does not support negative indexing with brackets, but the `at()` method does, where `-1` corresponds to the last item. Accessing an element is an O(1) operation.

  ```javascript
  const firstElement = myList[0];
  const lastElement = myList.at(-1); // or myList[myList.length - 1]
  ```

- **Finding Elements**: Use the `indexOf()` method to find the first occurrence of an element in an array. If the element is not found, it returns `-1` (rather than throwing).

  ```javascript
  let position = myList.indexOf('hello'); // Returns the index of 'hello'
  console.log(`'hello' is at position ${position}`); // Output: 'hello' is at position 1

  position = myList.indexOf('goodbye');
  if (position !== -1) {
      console.log(`'goodbye' is at position ${position}`);
  } else {
      console.log("'goodbye' is not in the list");
  }
  ```

### Iteration

Iterate over arrays using `for...of` loops:

```javascript
for (const value of myList) {
    console.log(value);
}
```
Use `.entries()` (or `.forEach()`) when you need both index and value:

```javascript
for (const [index, value] of myList.entries()) {
    console.log(`Index: ${index}, Value: ${value}`);
}

// Equivalent with forEach:
myList.forEach((value, index) => {
    console.log(`Index: ${index}, Value: ${value}`);
});
```

To iterate over more than one array simultaneously (the equivalent of Python's `zip`), loop by index up to the shorter length:

```javascript
const nums1 = [1, 3, 5];
const nums2 = [2, 4, 6];
for (let i = 0; i < Math.min(nums1.length, nums2.length); i++) {
    console.log(nums1[i], nums2[i]);
}
```

### Building Arrays Concisely

JavaScript has no list comprehensions, but `map`, `filter`, and `Array.from` cover the same ground succinctly and are often as readable as an equivalent loop.

```javascript
const squares = Array.from({ length: 10 }, (_, x) => x ** 2);
const evenSquares = Array.from({ length: 10 }, (_, x) => x)
    .filter(x => x % 2 === 0)
    .map(x => x ** 2);

// Nested / flattening a matrix
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
const flattenedMatrix = matrix.flat(); // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### Utility Functions

- **Min and Max**: Retrieve the smallest and largest elements with `Math.min`/`Math.max`, spreading the array. Both run in O(n) time across the array.

  ```javascript
  const numbers = [10, 20, 30];
  console.log(Math.min(...numbers));
  console.log(Math.max(...numbers));
  ```

- **Sum**: Calculate the total of elements with `reduce`, assuming they are numeric, in O(n) time.

  ```javascript
  const nums = [10, 20, 30];
  console.log(nums.reduce((acc, n) => acc + n, 0)); // Output: 60
  ```

- **Count**: Count occurrences of an element in O(n) time with `filter`.

  ```javascript
  console.log(myList.filter(x => x === 'hello').length);
  ```

### Array Slicing

The `slice()` method creates new arrays from existing arrays using the syntax `myList.slice(start, stop)`. Unlike Python, there is no built-in `step` argument.

- **Basic Slicing**: Slice an array to create a new subarray without modifying the original array. The `start` index is inclusive, while the `stop` index is exclusive. If `stop` is omitted, it slices to the end.

  ```javascript
  const myList = ['a', 'b', 'c', 'd', 'e'];
  const sublist = myList.slice(1, 4); // Elements from index 1 to 3
  console.log(sublist); // Output: ['b', 'c', 'd']

  const firstThreeItems = myList.slice(0, 3); // Gets the first three elements
  console.log(firstThreeItems); // Output: ['a', 'b', 'c']

  const lastThreeItems = myList.slice(-3); // Gets the last three elements
  console.log(lastThreeItems); // Output: ['c', 'd', 'e']
  ```

- **Copying Arrays**: Use `slice()` with no arguments (or the spread operator) to make a [shallow copy](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy) of the array.

  ```javascript
  const listCopy = myList.slice(); // Creates a copy of myList
  // const listCopy = [...myList]; // equivalent
  console.log(listCopy); // Output: ['a', 'b', 'c', 'd', 'e']
  ```

- **Reversing**: JavaScript's `slice` has no negative step, so reverse a copy with `toReversed()` (ES2023) or `slice().reverse()`.

  ```javascript
  const reversedList = myList.toReversed(); // or myList.slice().reverse()
  console.log(reversedList); // Output: ['e', 'd', 'c', 'b', 'a']
  ```

- **Skipping Elements**: To take every second element (Python's `step` of 2), filter by index.

  ```javascript
  const everySecondItem = myList.filter((_, i) => i % 2 === 0);
  console.log(everySecondItem); // Output: ['a', 'c', 'e']
  ```

- **Memory Considerations**: While slicing is a powerful tool, it's important to remember that `slice` creates a new array and therefore uses additional memory.

### Sorting and Reversing

#### Sorting Arrays

Sorting an array with `sort()` modifies it in place and returns the same array reference, while `toSorted()` (ES2023) returns a new sorted array. Both approaches have a time complexity of O(n log n).

Note: by default `sort()` converts elements to strings and sorts lexicographically. To sort numbers, pass a comparator `(a, b) => a - b`.

```javascript
let arr = ['banana', 'apple', 'cherry'];
arr.sort(); // Sorts arr in alphabetical order (default string comparison)
console.log(arr); // Output: ['apple', 'banana', 'cherry']

arr.sort((a, b) => b.localeCompare(a)); // Descending alphabetical order
console.log(arr); // Output: ['cherry', 'banana', 'apple']

arr.sort((a, b) => a.length - b.length); // Sorts arr by the length of the strings
console.log(arr); // Output: ['apple', 'banana', 'cherry']

const nums = [10, 3, 2, 8, 3, 1, 10];
const sortedNums = nums.toSorted((a, b) => a - b); // Returns a new sorted array
console.log(sortedNums); // Output: [1, 2, 3, 3, 8, 10, 10]

const sortedNumsDesc = nums.toSorted((a, b) => b - a);
console.log(sortedNumsDesc); // Output: [10, 10, 8, 3, 3, 2, 1]
```

#### Reversing Arrays

Reversing the array in place with `reverse()`:

```javascript
let arr = ['apple', 'banana', 'cherry'];
arr.reverse();
console.log(arr); // Output: ['cherry', 'banana', 'apple']
```

Unlike `reverse()`, `toReversed()` (ES2023) does not modify the array but instead returns a new reversed array, which you can loop over:

```javascript
let arr = ['apple', 'banana', 'cherry'];
arr.reverse();
console.log(arr); // Output: ['cherry', 'banana', 'apple']

arr = ['apple', 'banana', 'cherry'];
for (const item of arr.toReversed()) {
    console.log(item); // Prints 'cherry', 'banana', 'apple'
}
```

### Modifying Arrays

- **Updating Elements**: Direct assignment changes an element without affecting others, an O(1) operation.

  ```javascript
  const scores = [85, 90, 78];
  scores[2] = 95;
  console.log(scores); // Output: [85, 90, 95]
  ```

- **Appending**: Add an element to the end of the array with `push()`, a constant time operation:

  ```javascript
  myList.push('new item');
  ```

- **Extending**: Use `push(...items)` (spread) to add multiple elements from another iterable. The time complexity is O(k), where k is the length of the iterable being added.

  ```javascript
  myList.push(...[2, 4, 6]);
  ```

- **Inserting**: Inserting an element at a specific position with `splice(index, 0, value)` is more costly. If you insert at the beginning or somewhere in the middle of the array, it requires shifting all subsequent elements one position to the right. This operation has a time complexity of O(n - k), where k is the index of insertion because all elements after the index need to be moved.

  ```javascript
  const primes = [2, 3, 7, 11];
  primes.splice(2, 0, 5);
  console.log(primes); // Output: [2, 3, 5, 7, 11]
  ```

- **Popping by Index**: The `pop()` method removes the last element and returns it, an O(1) operation, as it does not require element shifting. To remove an element at an arbitrary index, use `splice(index, 1)`, which returns an array of the removed elements. Removing an intermediate element has a time complexity of O(n - k) because it necessitates moving all elements after the specified index one slot to the left to fill the gap.

  ```javascript
  const numbers = [1, 2, 3, 4];
  const lastItem = numbers.pop(); // Pops the last item, O(1)
  console.log(lastItem); // Output: 4
  console.log(numbers); // Output: [1, 2, 3]

  const firstItem = numbers.splice(0, 1)[0]; // Removes the first item, O(n - 1)
  console.log(firstItem); // Output: 1
  console.log(numbers); // Output: [2, 3]
  ```

- **Removing by Value**: There is no built-in "remove first occurrence by value" method; find the index with `indexOf` and `splice` it out, which can require shifting elements just like `splice(index, 1)`.

  ```javascript
  const numbers = [2, 10, 3, 10];
  const idx = numbers.indexOf(10);
  if (idx !== -1) numbers.splice(idx, 1);
  console.log(numbers); // Output: [2, 3, 10]
  ```

## Section 2: Handling Array Mutability with Care

Mutability in arrays enables dynamic adjustments to array contents, which is performant but also error-prone if not managed carefully.

### Modifying Arrays in Functions

When objects (e.g. arrays) are passed to functions, the reference is passed by value, so the function receives a reference to the same underlying array. This means that modifications within the function affect the original array, potentially leading to bugs if such changes are not intended.

```javascript
function findMedian(arr) {
    arr.sort((a, b) => a - b); // Sorts the array in-place, affecting the original array
    const middle = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[middle] : (arr[middle - 1] + arr[middle]) / 2;
}

const data = [5, 3, 8, 2, 5];
const median = findMedian(data);
console.log(data); // Output: [2, 3, 5, 5, 8]
```

To preserve the original data, make a copy of the array before modifying it:

```javascript
function findMedian(arr) {
    const localCopy = [...arr].sort((a, b) => a - b); // Sorts a copy, preserving the original
    const middle = Math.floor(localCopy.length / 2);
    return localCopy.length % 2 !== 0
        ? localCopy[middle]
        : (localCopy[middle - 1] + localCopy[middle]) / 2;
}

const data = [5, 3, 8, 2, 5];
const median = findMedian(data);
console.log(data); // Output: [5, 3, 8, 2, 5]
```

### Avoiding Shared References

Creating multiple references to the same array can lead to errors if the array is modified unexpectedly through one of the references.

```javascript
const a = [1, 2, 3];
const b = a; // Both `a` and `b` point to the same array
b.push(4);
console.log("List A:", a); // Output: [1, 2, 3, 4]
```

To ensure that variables have separate arrays, make explicit copies:

```javascript
const a = [1, 2, 3];
const b = [...a]; // `b` is now a separate copy of `a`
b.push(4);
console.log("List A:", a); // Output: [1, 2, 3]
console.log("List B:", b); // Output: [1, 2, 3, 4]
```

### Default Parameters and Closures: A Common Pitfall

Python has a famous "mutable default argument" pitfall where a default like `[]` is created once and shared across calls. JavaScript avoids this: a default parameter expression is re-evaluated on every call, so `function f(items = [])` gets a fresh array each time it's omitted.

```javascript
function processItem(newItem, processedItems = []) {
    processedItems.push(newItem);
    return processedItems;
}

console.log(processItem('apple'));  // Output: ['apple']
console.log(processItem('banana')); // Output: ['banana']
```

The JavaScript analogue of the Python trap is accidentally sharing a mutable value through a closure or an outer variable. For example, capturing an array declared outside the function makes it persist and accumulate across calls:

```javascript
const shared = [];
function processItemBad(newItem) {
    shared.push(newItem); // mutates the same array every call
    return shared;
}

console.log(processItemBad('apple'));  // Output: ['apple']
console.log(processItemBad('banana')); // Output: ['apple', 'banana']
```

To avoid this, keep state local (rely on the default-parameter behavior above) or explicitly copy before mutating.

## Section 3: Solved Problems

### Problem 1: Verify Derangement of an Array

**Problem Statement**: Determine if `arr2` is a valid [derangement](https://en.wikipedia.org/wiki/Derangement) of `arr1`. A derangement means that no element of `arr1` appears in the same index in `arr2`.

**Solution**:

```javascript
function isDerangement(arr1, arr2) {
    // 1) same length
    if (arr1.length !== arr2.length) {
        return false;
    }

    // 2) same elements (check as permutations via sorting)
    const sorted1 = [...arr1].sort((a, b) => a - b);
    const sorted2 = [...arr2].sort((a, b) => a - b);
    if (sorted1.some((v, i) => v !== sorted2[i])) {
        return false;
    }

    // 3) no fixed points
    return arr1.every((a, i) => a !== arr2[i]);
}
```

### Problem 2: Find the Second-Largest Element in an Array

**Problem Statement**: Develop a program that efficiently finds the second-largest element present in an array of integers.

**Solution**:

```javascript
function findSecondLargest(nums) {
    let first = -Infinity;
    let second = -Infinity;
    for (const num of nums) {
        if (num > first) {
            [first, second] = [num, first];
        } else if (first > num && num > second) {
            second = num;
        }
    }
    return second !== -Infinity ? second : null;
}

console.assert(findSecondLargest([12, 35, 1, 10, 34, 1]) === 34);
console.assert(findSecondLargest([100, 50, 100]) === 100);
```

### Problem 3: Merge Two Sorted Lists

**Problem Statement**: Write a function that merges two sorted arrays into a single sorted array.

**Solution**:

```javascript
function mergeSortedLists(list1, list2) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < list1.length && j < list2.length) {
        if (list1[i] < list2[j]) {
            result.push(list1[i]);
            i++;
        } else {
            result.push(list2[j]);
            j++;
        }
    }

    while (i < list1.length) {
        result.push(list1[i]);
        i++;
    }

    while (j < list2.length) {
        result.push(list2[j]);
        j++;
    }

    return result;
}
```

**Explanation**: The function iteratively compares elements from both arrays, appending the smaller one to the result array. After exhausting one array, it appends the remaining elements from the other array.

### Problem 4: [Rotate List](https://leetcode.com/problems/rotate-array/)

**Problem Statement**: Rotate a given integer array to the right by `k` steps.

**Solution 1: Linear Space Complexity**

```javascript
function rotateList(lst, k) {
    k = k % lst.length; // Handle rotations greater than the array length
    if (k === 0) return [...lst];
    return [...lst.slice(-k), ...lst.slice(0, -k)];
}
```

**Explanation**: The function splits the array at the `k`th position from the end and concatenates the two parts in reversed order, achieving the rotation.

**Related Problem**: How to determine if one string is a rotation of another? For example, if you have two strings, `s1 = "abcde"` and `s2 = "cdeab"`, you can see that `s2` is a rotation of `s1`. The key idea is that if `s2` is a rotation of `s1`, then `s2` will be a substring of `s1` concatenated with itself `(s1 + s1)`. For example, for `s1 = "abcde"` and `s2 = "cdeab"`, we see that `s2` is a substring of `"abcdeabcde"`.

**Solution 2: Constant Space Complexity**

```javascript
function rotate(nums, k) {
    k %= nums.length; // Normalize k to prevent unnecessary rotations
    if (k) {
        reverse(nums, 0, nums.length - 1); // Reverse the entire array
        reverse(nums, 0, k - 1);           // Reverse the first part
        reverse(nums, k, nums.length - 1); // Reverse the second part
    }
}

/**
 * Reverses elements from index `start` to `end` in the array `nums`.
 */
function reverse(nums, start, end) {
    while (start < end) {
        [nums[start], nums[end]] = [nums[end], nums[start]];
        start++;
        end--;
    }
}
```

This method does not use extra space for another array, making it space-efficient with an O(1) space complexity. The time complexity remains O(n).

### Problem 5: [Minimum Operations to Make the Array Increasing](https://leetcode.com/problems/minimum-operations-to-make-the-array-increasing/)

**Problem Statement**: You are given an integer array `nums`. In one operation, you can choose an element of the array and increment it by 1. Determine the minimum number of operations needed to make the array strictly increasing.

**Solution**:

```javascript
function minOperations(nums) {
    let operations = 0;

    for (let i = 1; i < nums.length; i++) {
        if (nums[i] <= nums[i - 1]) {
            const increment = nums[i - 1] - nums[i] + 1;
            nums[i] += increment;
            operations += increment;
        }
    }

    return operations;
}
```

**Explanation**: Iterate through the array, comparing each element to its predecessor. If an element is not greater than its predecessor, increment it just enough to make the sequence strictly increasing, and count the operations.


### Problem 6: [Count Number of Teams](https://leetcode.com/problems/count-number-of-teams/)

**Problem Statement**: You are given an array of soldier ratings. A team of 3 soldiers is considered increasing if their ratings are ordered such that `rating[i] < rating[j] < rating[k]` and `i < j < k`. Similarly, a team is considered decreasing if `rating[i] > rating[j] > rating[k]` and `i < j < k`. A team can be formed if it's either increasing or decreasing. Your task is to return the number of teams you can form given the ratings.

**Solution**:

```javascript
function numTeams(ratings) {
    let count = 0;
    const n = ratings.length;
    for (let i = 0; i < n; i++) {
        let lessLeft = 0, moreLeft = 0, lessRight = 0, moreRight = 0;
        for (let j = 0; j < i; j++) {
            if (ratings[j] < ratings[i]) lessLeft++;
            if (ratings[j] > ratings[i]) moreLeft++;
        }
        for (let j = i + 1; j < n; j++) {
            if (ratings[j] < ratings[i]) lessRight++;
            if (ratings[j] > ratings[i]) moreRight++;
        }
        count += lessLeft * moreRight + moreLeft * lessRight;
    }
    return count;
}
```

**Explanation**: For each soldier, count the number of soldiers with a higher rating on the right (potential successors) and the number of soldiers with a lower rating on the left (potential predecessors). Multiply these counts to get the number of teams the soldier can form in both increasing and decreasing order.

### Problem 7: [Summary Ranges](https://leetcode.com/problems/summary-ranges/description/)

**Problem Statement**: Given a sorted unique integer array nums, return the smallest sorted list of ranges that cover all the numbers in the array exactly. Each range is represented as a string in the format "start->end".

**Solution**:

```javascript
function summaryRanges(nums) {
    if (nums.length === 0) {
        return [];
    }

    const ranges = [];
    let start = nums[0];

    for (let i = 1; i < nums.length; i++) {
        if (nums[i] !== nums[i - 1] + 1) {
            ranges.push(start !== nums[i - 1] ? `${start}->${nums[i - 1]}` : `${start}`);
            start = nums[i];
        }
    }
    const last = nums[nums.length - 1];
    ranges.push(start !== last ? `${start}->${last}` : `${start}`);

    return ranges;
}
```
**Explanation**: Iterate through the array, tracking the start of the current range. When you detect a break in the sequence (current number is not one more than the previous), close the current range and start a new one.

### Problem 8: [Missing Ranges](https://www.lintcode.com/problem/641/)

**Problem Statement**: Given a sorted integer array nums, where the range of elements are in the inclusive range [lower, upper], return its missing ranges.

**Solution**:

```javascript
function findMissingRanges(nums, lower, upper) {
    const result = [];
    let prev = lower - 1;

    for (let i = 0; i <= nums.length; i++) {
        const curr = i < nums.length ? nums[i] : upper + 1;
        if (prev + 1 <= curr - 1) {
            result.push(prev + 1 < curr - 1 ? `${prev + 1}->${curr - 1}` : `${prev + 1}`);
        }
        prev = curr;
    }

    return result;
}
```

**Explanation**: Compare adjacent elements to find gaps. For each gap, add the missing range to the result. Pay special attention to the boundaries, defined by `lower` and `upper`.

### Problem 9: [Majority Element](https://leetcode.com/problems/majority-element)

**Problem Statement**: Given an array `nums` of size `n`, find the majority element. The majority element is the element that appears more than `n/2` times. You may assume that the majority element always exists in the array.

**Solution**:

```javascript
function majorityElement(nums) {
    let count = 0;
    let candidate = null;

    for (const num of nums) {
        if (count === 0) {
            candidate = num;
        }
        count += (num === candidate ? 1 : -1);
    }

    return candidate;
}
```
**Explanation**: [The Boyer–Moore algorithm](https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_majority_vote_algorithm) is a clever method that leverages the property of the majority element to efficiently find it in linear time and constant space. It maintains a count and a candidate element. Iterating through the array, it adjusts the count based on whether the current element is the same as the candidate. If the count reaches zero, it chooses a new candidate.

### Problem 10: [Majority Element II](https://leetcode.com/problems/majority-element-ii)

**Problem Statement**: Given an integer array of size `n`, find all elements that appear more than `n/3` times.

**Solution**:

```javascript
function majorityElementII(nums) {
    if (nums.length === 0) {
        return [];
    }

    // Potential candidates for majority element
    let candidate1 = null, candidate2 = null, count1 = 0, count2 = 0;

    for (const num of nums) {
        if (candidate1 === num) {
            count1++;
        } else if (candidate2 === num) {
            count2++;
        } else if (count1 === 0) {
            candidate1 = num;
            count1 = 1;
        } else if (count2 === 0) {
            candidate2 = num;
            count2 = 1;
        } else {
            count1--;
            count2--;
        }
    }

    // Verification step
    const threshold = Math.floor(nums.length / 3);
    return [candidate1, candidate2].filter(
        n => nums.filter(x => x === n).length > threshold
    );
}
```
**Explanation**: Since there can be at most two elements in the array that appear more than `n/3` times, you can modify the Boyer-Moore algorithm to maintain two candidates and their counts.

### Problem 11: [Global and Local Inversions](https://leetcode.com/problems/global-and-local-inversions/)

**Problem Statement**: You are given an integer array `A` of size `N`. A global inversion occurs when `i < j` and `A[i] > A[j]`. A local inversion occurs when `i < j` and `A[i] > A[j]` for `j = i + 1`. The task is to determine if the number of global inversions is equal to the number of local inversions.

**Solution**:

```javascript
function isIdealPermutation(A) {
    let maxSoFar = -1;
    for (let i = 2; i < A.length; i++) {
        maxSoFar = Math.max(maxSoFar, A[i - 2]);
        if (maxSoFar > A[i]) {
            return false;
        }
    }
    return true;
}
```

**Explanation**: Observe that a local inversion is always a global inversion, but the reverse isn't always true. We can check for the presence of non-local global inversions by comparing elements against the running maximum up to two positions prior.

### Problem 12: [Find All Numbers Disappeared in an Array](https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array)

**Problem Statement**: Given an array `nums` of `n` integers where `nums[i]` is in the range `[1, n]`, return an array of all the integers in the range `[1, n]` that do not appear in `nums`.

**Solution**:

```javascript
function findDisappearedNumbers(nums) {
    for (let i = 0; i < nums.length; i++) {
        const index = Math.abs(nums[i]) - 1;
        nums[index] = -Math.abs(nums[index]);
    }

    const result = [];
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] > 0) {
            result.push(i + 1);
        }
    }
    return result;
}
```
**Explanation**: Iterate over the array, and for each value `val` encountered, mark the position `nums[val - 1]` as visited by making it negative (if it's not already). Iterate through the modified array. The indices of positive values correspond to the missing numbers.

### Problem 13: [Maximum Length of Subarray With Positive Product](https://leetcode.com/problems/maximum-length-of-subarray-with-positive-product/)

**Problem Statement**: Given an array of integers `nums`, find the maximum length of a subarray where the product of all its elements is positive.

**Solution**:

```javascript
function getMaxLen(nums) {
    let positive = 0, negative = 0, maxLen = 0;

    for (const num of nums) {
        if (num > 0) {
            [positive, negative] = [positive + 1, negative ? negative + 1 : 0];
        } else if (num < 0) {
            [positive, negative] = [negative ? negative + 1 : 0, positive + 1];
        } else {
            [positive, negative] = [0, 0];
        }
        maxLen = Math.max(maxLen, positive);
    }

    return maxLen;
}
```

**Explanation**: Maintain counters for the lengths of the latest subarrays with a positive and negative product. Update these lengths as you iterate through the array, resetting or swapping based on the sign of the current element. Update the maximum length of a subarray with a positive product at each step.

### Problem 14: [Partition Array into Disjoint Intervals](https://leetcode.com/problems/partition-array-into-disjoint-intervals/)

**Problem Statement**: Given an array `nums`, partition it into two subarrays `left` and `right` so that:

- Every element in `left` is less than or equal to every element in `right`, unless `right` is empty.
- `left` is non-empty.
- `left` has the smallest possible size.

Return the length of `left` after such a partitioning.

**Solution**:

```javascript
function partitionDisjoint(nums) {
    let leftMax = nums[0], maxSoFar = nums[0], partitionIdx = 0;
    for (let i = 0; i < nums.length; i++) {
        maxSoFar = Math.max(maxSoFar, nums[i]);
        if (nums[i] < leftMax) {
            leftMax = maxSoFar;
            partitionIdx = i;
        }
    }
    return partitionIdx + 1;
}
```

**Explanation**: Iterate through the array, tracking the maximum value in the left partition and the maximum value seen so far. When the current value is less than the maximum of the left partition, update the partition boundary.

## Section 4: Exercises

1. **[Reverse a String](https://leetcode.com/problems/reverse-string/)**
2. **[Check if Array is Good](https://leetcode.com/problems/check-if-array-is-good/)**
3. **[Transformed Array](https://leetcode.com/problems/transformed-array/description/)**
4. **[Concatenation of Array](https://leetcode.com/problems/concatenation-of-array/)**
5. **[Running Sum of 1D Array](https://leetcode.com/problems/running-sum-of-1d-array)**
6. **[Missing Number](https://leetcode.com/problems/missing-number)**
7. **[Plus One](https://leetcode.com/problems/plus-one/)**
8. **[Self-Dividing Numbers](https://leetcode.com/problems/self-dividing-numbers/)**
9. **[Palindrome Number](https://leetcode.com/problems/palindrome-number/)**
10. **[Remove Element](https://leetcode.com/problems/remove-element/)**
11. **[Find All K-Distant Indices in an Array](https://leetcode.com/problems/find-all-k-distant-indices-in-an-array/)**
12. **[Find Polygon with the Largest Perimeter](https://leetcode.com/problems/find-polygon-with-the-largest-perimeter/)**
13. **[Minimum Processing Time](https://leetcode.com/problems/minimum-processing-time/)**
14. **[Move Zeroes](https://leetcode.com/problems/move-zeroes/)**
15. **[Two Sum](https://leetcode.com/problems/two-sum/)**
16. **[Two Sum II](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)**
17. **[Array Nesting](https://leetcode.com/problems/array-nesting/)**
18. **[Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)**
19. **[Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)**
20. **[Minimum Removals to Balance Array](https://leetcode.com/problems/minimum-removals-to-balance-array/)**
